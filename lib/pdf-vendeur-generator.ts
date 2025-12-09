import { PDFDocument, StandardFonts, rgb, type RGB, type PDFPage } from "pdf-lib"
import { readFile } from "fs/promises"
import path from "path"

// Brand and style (identique au PDF locataire)
const PRIMARY = rgb(0 / 255, 114 / 255, 188 / 255) // #0072BC (brand blue)
const TEXT_INFO = rgb(110 / 255, 110 / 255, 110 / 255) // #6E6E6E (secondary text)
const BLACK = rgb(0, 0, 0)
const SEP_GRAY = rgb(218 / 255, 218 / 255, 218 / 255) // #DADADA separator

// Page and layout (A4) - OPTIMISÉ POUR 1 PAGE ET IMPRESSION
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 35
const GUTTER = 20
const LABEL_WIDTH = 120
const VALUE_INDENT = 4
const TITLE_SIZE = 17
const SECTION_SIZE = 13
const LABEL_SIZE = 10
const BODY_SIZE = 11
const LINE_HEIGHT = 12
const LONG_LINE_HEIGHT = Math.round(BODY_SIZE * 1.3)
const BOTTOM_RESERVE = 60

// Utilities
const nonEmpty = (v?: string | null) => Boolean(v && String(v).trim() !== "")
const dash = "-"
const showOrDash = (v?: string | null) => (nonEmpty(v) ? String(v) : dash)

function toTitleCase(s?: string | null) {
  if (!nonEmpty(s)) return ""
  const lower = String(s).toLowerCase()
  return lower.replace(/\p{L}+/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1))
}

function normalizeCivilite(c?: string | null) {
  const v = (c || "").toLowerCase().trim()
  if (v.startsWith("m.") || v === "m" || v.startsWith("mr") || v === "homme" || v === "monsieur") return "M."
  if (v.startsWith("mme") || v.includes("madame") || v === "femme" || v.startsWith("mlle") || v.startsWith("mademoiselle")) return "Mme"
  return c || ""
}

// Sanitize text for Helvetica (WinAnsi)
function pdfSafe(input?: string | null) {
  if (!input) return ""
  return input
    .normalize("NFKC")
    .replace(/[\u202F\u00A0\u2009\u2007\u2060]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
}

// Format date
function formatDateFR(input?: string | null) {
  if (!nonEmpty(input)) return ""
  const s = String(input).trim()
  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (dmy) return `${dmy[1].padStart(2, "0")}/${dmy[2].padStart(2, "0")}/${dmy[3]}`
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  return s
}

function formatLieuNaissance(input?: string | null) {
  const raw = (input || "").replace(/[/,]/g, " ").replace(/\s+/g, " ").trim()
  if (!raw) return ""
  const m = raw.match(/(\d{5})/)
  if (m && m.index !== undefined) {
    const cp = m[1]
    const before = raw.slice(0, m.index).trim()
    const after = raw.slice(m.index + 5).trim()
    const city = (before || after).trim()
    return `${city} ${cp}`.trim()
  }
  return raw
}

// Robust word wrap
function breakLongTokenByWidth(token: string, font: any, size: number, maxWidth: number): string[] {
  const parts: string[] = []
  let start = 0
  while (start < token.length) {
    let lo = start + 1
    let hi = token.length
    let best = lo
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const slice = token.slice(start, mid)
      const w = font.widthOfTextAtSize(slice, size)
      if (w <= maxWidth || slice.length === 1) {
        best = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    const piece = token.slice(start, best)
    if (!piece) break
    parts.push(piece)
    start = best
  }
  return parts.length ? parts : [token]
}

function wrapByWidth(text: string, font: any, size: number, maxWidth: number): string[] {
  const t = pdfSafe(text)
  if (!t) return [dash]
  const words = t.split(/\s+/)
  const lines: string[] = []
  let current = ""

  function pushCurrent() {
    if (current) {
      lines.push(current)
      current = ""
    }
  }

  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w
    const candWidth = font.widthOfTextAtSize(candidate, size)
    const wWidth = font.widthOfTextAtSize(w, size)

    if (wWidth > maxWidth) {
      pushCurrent()
      const pieces = breakLongTokenByWidth(w, font, size, maxWidth)
      for (const p of pieces) {
        lines.push(p)
      }
      continue
    }

    if (candWidth > maxWidth && current) {
      lines.push(current)
      current = w
    } else {
      current = candidate
    }
  }
  pushCurrent()

  return lines.length ? lines : [dash]
}

// Address splitter
function splitAddressLines(adresse?: string | null): [string, string] {
  const s = (adresse || "").trim()
  if (!s) return [dash, dash]
  const byNl = s
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean)
  if (byNl.length >= 2) return [pdfSafe(byNl[0]), pdfSafe(byNl[1])]
  const cpMatch = s.match(/\b(\d{5})\b/)
  if (cpMatch && cpMatch.index !== undefined) {
    const idx = cpMatch.index
    const line1 = s
      .slice(0, idx)
      .replace(/[,-]\s*$/, "")
      .trim()
    const line2 = s.slice(idx).trim()
    return [pdfSafe(line1 || dash), pdfSafe(line2 || dash)]
  }
  const lastComma = s.lastIndexOf(",")
  if (lastComma > -1) {
    const line1 = s.slice(0, lastComma).trim()
    const line2 = s.slice(lastComma + 1).trim()
    return [pdfSafe(line1 || dash), pdfSafe(line2 || dash)]
  }
  return [pdfSafe(s), dash]
}

// Type Row
type Row = {
  label: string
  value: string | string[]
  highlight?: boolean
  valueBelowLabel?: boolean // Forcer l'affichage de la valeur sous le label pour éviter les chevauchements
}

// Drawing primitives
const toValue = (v?: string | null): string => pdfSafe(showOrDash(v))
const toArrayValue = (arr: (string | null | undefined)[]): string[] =>
  arr
    .map((v) => toValue(v || ""))
    .filter((v) => v !== dash || arr.length === 1) // garder un seul tiret si tableau vide

function drawCenteredText(page: any, text: string, y: number, font: any, size: number, color: RGB) {
  const w = font.widthOfTextAtSize(text, size)
  const x = (PAGE_WIDTH - w) / 2
  page.drawText(text, { x, y, size, font, color })
  return y
}

function drawFooter(page: any, fontReg: any) {
  const text = pdfSafe("Document strictement confidentiel – transmis à titre informatif")
  const size = 9
  const w = fontReg.widthOfTextAtSize(text, size)
  const x = (PAGE_WIDTH - w) / 2
  const y = MARGIN - 24
  page.drawText(text, { x, y, size, font: fontReg, color: TEXT_INFO })
}

// Section header
function drawSectionHeader(page: any, title: string, x: number, y: number, fontBold: any) {
  y -= 12
  const header = pdfSafe(title.toUpperCase())
  page.drawText(header, { x, y, size: SECTION_SIZE, font: fontBold, color: PRIMARY })
  const yy = y - 10
  page.drawLine({
    start: { x, y: yy },
    end: { x: page.getWidth() - x, y: yy },
    thickness: 1,
    color: SEP_GRAY,
  })
  return yy - 10
}

// Header on each page: centered logo, centered uppercase title, centered info text
async function drawHeader(page: any, pdf: PDFDocument, fontBold: any, fontReg: any) {
  const yTop = PAGE_HEIGHT - MARGIN

  // Logo (centered, max-height 30px)
  let logoImage: any | null = null
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo-alv.png")
    const logoBytes = await readFile(logoPath)
    logoImage = await pdf.embedPng(logoBytes)
  } catch {
    // ignore if logo not found
  }

  let y = yTop
  if (logoImage) {
    const logoHeight = 30
    const ratio = logoHeight / logoImage.height
    const logoWidth = logoImage.width * ratio
    const x = (PAGE_WIDTH - logoWidth) / 2
    page.drawImage(logoImage, { x, y: yTop - logoHeight, width: logoWidth, height: logoHeight })
    y = yTop - logoHeight - 10
  } else {
    y = yTop - 10
  }

  // Title (centered, uppercase, brand blue)
  y -= 8
  drawCenteredText(page, pdfSafe("FICHE DE RENSEIGNEMENT VENDEUR"), y, fontBold, TITLE_SIZE, PRIMARY)
  y -= TITLE_SIZE

  // Small centered grey paragraph
  y -= 5
  const intro =
    "Document strictement confidentiel – destiné à un usage vente. " +
    "Ce document synthétise les informations personnelles communiquées via notre formulaire en ligne."
  const maxWidth = PAGE_WIDTH * 0.9
  const paragraphs: string[] = []
  {
    const words = pdfSafe(intro).split(/\s+/)
    let current = ""
    for (const w of words) {
      const cand = current ? `${current} ${w}` : w
      const width = fontReg.widthOfTextAtSize(cand, BODY_SIZE - 1)
      if (width > maxWidth && current) {
        paragraphs.push(current)
        current = w
      } else {
        current = cand
      }
    }
    if (current) paragraphs.push(current)
  }
  for (const line of paragraphs) {
    const w = fontReg.widthOfTextAtSize(line, BODY_SIZE - 1)
    const x = (PAGE_WIDTH - w) / 2
    page.drawText(line, { x, y, size: BODY_SIZE - 1, font: fontReg, color: TEXT_INFO })
    y -= Math.round((BODY_SIZE - 1) * 1.2)
  }

  return y - 6
}

// Context for pagination-aware drawing
type Fonts = { reg: any; bold: any }
type DocContext = {
  pdf: PDFDocument
  page: PDFPage
  y: number
  fonts: Fonts
}

// Ensure enough space; if not, finish current page with footer and create a new page with header
async function ensureSpace(ctx: DocContext, neededHeight: number) {
  // Vérifier avec une marge de sécurité supplémentaire pour éviter les superpositions
  const safetyMargin = 10
  if (ctx.y - neededHeight - safetyMargin < BOTTOM_RESERVE) {
    drawFooter(ctx.page, ctx.fonts.reg)
    const page = ctx.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    const y = await drawHeader(page, ctx.pdf, ctx.fonts.bold, ctx.fonts.reg)
    ctx.page = page
    ctx.y = y - 6
  }
}

// Prepare wrapped lines and measure height per part for a row
type PreparedPart = { lines: string[]; lh: number }
type PreparedRow = { parts: PreparedPart[]; totalHeight: number; valueBelow: boolean }

function prepareRowParts(row: Row, font: any, colMaxWidth: number, labelWidth?: number): PreparedRow {
  // Calculer la largeur disponible pour la valeur en fonction de la largeur réelle du label
  const effectiveLabelWidth = Math.max(LABEL_WIDTH, (labelWidth ?? LABEL_WIDTH)) + VALUE_INDENT + 6 // +6 pour un petit gap
  const maxWidth = colMaxWidth - effectiveLabelWidth - 4 // marge interne minime
  // Ajout conditionnel d'un offset vertical uniquement si nécessaire (wrap ou demande explicite)
  const shouldOffset = (parts: PreparedPart[]) =>
    row.valueBelowLabel || parts.some((p) => p.lines.length > 1 || p.lines.length === 0 || p.lh > LINE_HEIGHT)
  
  if (typeof row.value === 'string') {
    const lines = wrapByWidth(row.value || dash, font, BODY_SIZE, maxWidth)
    const lh = lines.length >= 3 ? LONG_LINE_HEIGHT : LINE_HEIGHT
    const parts: PreparedPart[] = [{ lines, lh }]
    const extraOffset = shouldOffset(parts) ? LINE_HEIGHT : 0
    const totalHeight = lines.length * lh + extraOffset
    return { parts, totalHeight, valueBelow: extraOffset > 0 }
  }
  
  if (Array.isArray(row.value) && row.value.length > 0) {
    const stringValues = row.value.filter(v => typeof v === 'string') as string[]
    if (stringValues.length === 0) {
      const lines = wrapByWidth(dash, font, BODY_SIZE, maxWidth)
      const lh = LINE_HEIGHT
      const parts: PreparedPart[] = [{ lines, lh }]
      const extraOffset = shouldOffset(parts) ? LINE_HEIGHT : 0
      return { parts, totalHeight: lh + extraOffset, valueBelow: extraOffset > 0 }
    }
    
    const parts: PreparedPart[] = stringValues.map((part) => {
      const lines = wrapByWidth(part, font, BODY_SIZE, maxWidth)
      const lh = lines.length >= 3 ? LONG_LINE_HEIGHT : LINE_HEIGHT
      return { lines, lh }
    })
    const extraOffset = shouldOffset(parts) ? LINE_HEIGHT : 0
    const totalHeight = parts.reduce((acc, p) => acc + p.lines.length * p.lh, 0) + extraOffset
    return { parts, totalHeight, valueBelow: extraOffset > 0 }
  }
  
  const lines = wrapByWidth(dash, font, BODY_SIZE, maxWidth)
  const lh = LINE_HEIGHT
  const parts: PreparedPart[] = [{ lines, lh }]
  const extraOffset = shouldOffset(parts) ? LINE_HEIGHT : 0
  return { parts, totalHeight: lh + extraOffset, valueBelow: extraOffset > 0 }
}

function drawLabeledRowFromPrepared(ctx: DocContext, row: Row, prepared: PreparedRow, xLabel: number, xValue: number) {
  const valueFont = row.highlight ? ctx.fonts.bold : ctx.fonts.reg
  
  // Dessiner le label
  ctx.page.drawText(pdfSafe(row.label), { x: xLabel, y: ctx.y, size: LABEL_SIZE, font: ctx.fonts.bold, color: BLACK })
  const labelWidth = ctx.fonts.bold.widthOfTextAtSize(pdfSafe(row.label), LABEL_SIZE)
  const baseValueX = Math.max(xValue, xLabel + labelWidth + VALUE_INDENT + 6)
  
  // Dessiner la valeur (peut être sur plusieurs lignes)
  const startOffset = prepared.valueBelow ? LINE_HEIGHT : 0
  let yy = ctx.y - startOffset
  let hasContent = false
  for (const part of prepared.parts) {
    for (let i = 0; i < part.lines.length; i++) {
      const line = part.lines[i]
      if (line.trim() === "") continue
      hasContent = true
      const xPos = i === 0 ? baseValueX : baseValueX + 20
      ctx.page.drawText(pdfSafe(line), { x: xPos, y: yy, size: BODY_SIZE, font: valueFont, color: BLACK })
      yy -= part.lh
    }
  }
  
  // Mettre à jour la position Y : utiliser la position la plus basse, avec un espacement minimum
  if (hasContent) {
    ctx.y = yy - 4 // Espacement de 4px entre les lignes
  } else {
    ctx.y = ctx.y - LINE_HEIGHT - startOffset - 4 // Si pas de contenu, descendre quand même
  }
}

// Single column aligned to left (for 1 person), with pagination
async function drawSingleLeftAlignedColumnWithBreaks(ctx: DocContext, p?: any, personTitle: string = "Vendeur") {
  // Utiliser toute la largeur disponible, aligné à gauche
  const total = PAGE_WIDTH - 2 * MARGIN
  const colWidth = total // Utiliser toute la largeur disponible
  const xLeft = MARGIN

  // Heading
  await ensureSpace(ctx, 20)
  ctx.page.drawText(pdfSafe(personTitle), { x: xLeft, y: ctx.y, size: 11, font: ctx.fonts.bold, color: PRIMARY })
  ctx.y -= 16

  // Identité
  await ensureSpace(ctx, 30)
  ctx.y = drawSectionHeader(ctx.page, "Identité", xLeft, ctx.y, ctx.fonts.bold)
  const xLabel = xLeft
  const xValue = xLeft + LABEL_WIDTH + VALUE_INDENT

  const date = formatDateFR(p?.dateNaissance)
  const lieu = formatLieuNaissance(p?.lieuNaissance)
  const dateLieu =
    nonEmpty(date) || nonEmpty(lieu)
      ? [nonEmpty(date) ? date : undefined, nonEmpty(lieu) ? lieu : undefined].filter(Boolean).join(", ")
      : dash

  const identityRows: Row[] = [
    { label: "Civilité", value: pdfSafe(normalizeCivilite(p?.civilite) || dash) },
    { label: "Nom", value: pdfSafe(toTitleCase(p?.nom) || dash) },
    { label: "Prénom", value: pdfSafe(toTitleCase(p?.prenom) || dash) },
    { label: "Date et lieu de naissance", value: pdfSafe(dateLieu) },
    { label: "Nationalité", value: pdfSafe(showOrDash(p?.nationalite)) },
    { label: "Email", value: pdfSafe(showOrDash(p?.email)) },
    { label: "Téléphone", value: pdfSafe(showOrDash(p?.telephone)) },
    { label: "Adresse de résidence", value: pdfSafe(showOrDash(p?.adresse)) },
  ]

  for (const row of identityRows) {
    const fontValue = row.highlight ? ctx.fonts.bold : ctx.fonts.reg
    const labelWidth = ctx.fonts.bold.widthOfTextAtSize(pdfSafe(row.label), LABEL_SIZE)
    const prep = prepareRowParts(row, fontValue, colWidth, labelWidth)
    await ensureSpace(ctx, prep.totalHeight + 3) // Plus d'espace pour éviter les superpositions
    drawLabeledRowFromPrepared(ctx, row, prep, xLabel, xValue)
  }

  // Résidence fiscale
  await ensureSpace(ctx, 30)
  ctx.y = drawSectionHeader(ctx.page, "Résidence fiscale", xLeft, ctx.y, ctx.fonts.bold)
  
  const residenceRows: Row[] = [
    { label: "Résidence fiscale en France", value: pdfSafe(showOrDash(p?.residenceFiscaleFrance)) },
  ]
  
  if (p?.residenceFiscaleFrance === "non") {
    residenceRows.push(
      { label: "Pays résidence fiscale", value: pdfSafe(showOrDash(p?.residenceFiscalePays)) },
      { label: "Adresse fiscale", value: pdfSafe(showOrDash(p?.residenceFiscaleAdresse)) },
      { label: "Numéro d'identification fiscale", value: pdfSafe(showOrDash(p?.residenceFiscaleNumero)) }
    )
  }

  for (const row of residenceRows) {
    const fontValue = row.highlight ? ctx.fonts.bold : ctx.fonts.reg
    const labelWidth = ctx.fonts.bold.widthOfTextAtSize(pdfSafe(row.label), LABEL_SIZE)
    const prep = prepareRowParts(row, fontValue, colWidth, labelWidth)
    await ensureSpace(ctx, prep.totalHeight + 3) // Plus d'espace pour éviter les superpositions
    drawLabeledRowFromPrepared(ctx, row, prep, xLabel, xValue)
  }

  // Situation matrimoniale
  await ensureSpace(ctx, 30)
  ctx.y = drawSectionHeader(ctx.page, "Situation matrimoniale", xLeft, ctx.y, ctx.fonts.bold)
  
  const situationRows: Row[] = [
    { label: "Situation matrimoniale", value: pdfSafe(showOrDash(p?.situationMatrimoniale)) },
  ]

  const d = p?.situationDetails || {}
  const detailFields: Array<[string, string]> = [
    ["Conjoint / partenaire", d.conjointNomPrenom || d.partenaireNomPrenom || ""],
    ["Ville du mariage", d.villeMariage],
    ["Date du mariage", d.dateMariage],
    ["Notaire (contrat / changement)", d.notaireNom],
    ["Ville de l'étude du notaire", d.notaireVille],
    ["Date du contrat / changement", d.dateContrat],
    ["Régime d'origine", d.regimeOrigine],
    ["Régime actuel", d.regimeActuel],
    ["Date PACS", d.datePacs],
    ["Conjoint décédé", d.conjointDecede],
    ["Divorce : date/lieu", d.divorceDetails],
    ["Autre description", d.autreDescription],
  ]
  
  detailFields.forEach(([label, val]) => {
    if (nonEmpty(val)) situationRows.push({ label, value: pdfSafe(val) })
  })

  for (const row of situationRows) {
    const fontValue = row.highlight ? ctx.fonts.bold : ctx.fonts.reg
    const labelWidth = ctx.fonts.bold.widthOfTextAtSize(pdfSafe(row.label), LABEL_SIZE)
    const prep = prepareRowParts(row, fontValue, colWidth, labelWidth)
    await ensureSpace(ctx, prep.totalHeight + 3) // Plus d'espace pour éviter les superpositions
    drawLabeledRowFromPrepared(ctx, row, prep, xLabel, xValue)
  }

  // Représentation
  await ensureSpace(ctx, 30)
  ctx.y = drawSectionHeader(ctx.page, "Représentation", xLeft, ctx.y, ctx.fonts.bold)
  
  const representationRows: Row[] = [
    { label: "Présence à la signature", value: pdfSafe(p?.representation?.seraPresent === "non" ? "Représenté" : "Présent") },
  ]
  
  if (p?.representation?.seraPresent === "non") {
    representationRows.push(
      { label: "Représentant", value: pdfSafe(`${showOrDash(p?.representation?.representantPrenom)} ${showOrDash(p?.representation?.representantNom)}`) },
      { label: "Téléphone représentant", value: pdfSafe(showOrDash(p?.representation?.representantTelephone)) },
      { label: "Email représentant", value: pdfSafe(showOrDash(p?.representation?.representantEmail)) }
    )
  }

  for (const row of representationRows) {
    const fontValue = row.highlight ? ctx.fonts.bold : ctx.fonts.reg
    const labelWidth = ctx.fonts.bold.widthOfTextAtSize(pdfSafe(row.label), LABEL_SIZE)
    const prep = prepareRowParts(row, fontValue, colWidth, labelWidth)
    await ensureSpace(ctx, prep.totalHeight + 3) // Plus d'espace pour éviter les superpositions
    drawLabeledRowFromPrepared(ctx, row, prep, xLabel, xValue)
  }

  // Notaire
  await ensureSpace(ctx, 30)
  ctx.y = drawSectionHeader(ctx.page, "Notaire", xLeft, ctx.y, ctx.fonts.bold)
  
  const notaireRows: Row[] = [
    { label: "Notaire désigné", value: pdfSafe(showOrDash(p?.notaireDesigne || "non")) },
  ]
  
  if (p?.notaireDesigne === "oui") {
    notaireRows.push(
      { label: "Nom du notaire", value: pdfSafe(showOrDash(p?.notaireNom)) },
      { label: "Ville de l'étude", value: pdfSafe(showOrDash(p?.notaireVille)) }
    )
  }

  for (const row of notaireRows) {
    const fontValue = row.highlight ? ctx.fonts.bold : ctx.fonts.reg
    const labelWidth = ctx.fonts.bold.widthOfTextAtSize(pdfSafe(row.label), LABEL_SIZE)
    const prep = prepareRowParts(row, fontValue, colWidth, labelWidth)
    await ensureSpace(ctx, prep.totalHeight + 3) // Plus d'espace pour éviter les superpositions
    drawLabeledRowFromPrepared(ctx, row, prep, xLabel, xValue)
  }

  // Précisions complémentaires
  if (nonEmpty(p?.precisions)) {
    await ensureSpace(ctx, 30)
    ctx.y = drawSectionHeader(ctx.page, "Précisions complémentaires", xLeft, ctx.y, ctx.fonts.bold)
    
    const precisionsRow: Row = { label: "Précisions", value: pdfSafe(p?.precisions || "") }
    const fontValue = precisionsRow.highlight ? ctx.fonts.bold : ctx.fonts.reg
    const labelWidth = ctx.fonts.bold.widthOfTextAtSize(pdfSafe(precisionsRow.label), LABEL_SIZE)
    const prep = prepareRowParts(precisionsRow, fontValue, colWidth, labelWidth)
    await ensureSpace(ctx, prep.totalHeight + 3) // Plus d'espace pour éviter les superpositions
    drawLabeledRowFromPrepared(ctx, precisionsRow, prep, xLabel, xValue)
  }
}

async function drawRowsSection(ctx: DocContext, title: string, rows: Row[], xLeft: number = MARGIN) {
  const colWidth = PAGE_WIDTH - 2 * MARGIN
  const xLabel = xLeft
  const xValue = xLeft + LABEL_WIDTH + VALUE_INDENT

  await ensureSpace(ctx, 30)
  ctx.y = drawSectionHeader(ctx.page, title, xLeft, ctx.y, ctx.fonts.bold)

  for (const row of rows) {
    const fontValue = row.highlight ? ctx.fonts.bold : ctx.fonts.reg
    const labelWidth = ctx.fonts.bold.widthOfTextAtSize(pdfSafe(row.label), LABEL_SIZE)
    const prep = prepareRowParts(row, fontValue, colWidth, labelWidth)
    await ensureSpace(ctx, prep.totalHeight + 3)
    drawLabeledRowFromPrepared(ctx, row, prep, xLabel, xValue)
  }
}

async function drawSociete(ctx: DocContext, data: any) {
  const soc = data?.societe || {}
  const repPhys = soc.representantPhysique || {}
  const repSoc = soc.representantSociete || {}
  const repAutre = soc.representantAutre || {}

  await drawRowsSection(ctx, "Société vendeuse", [
    { label: "Dénomination", value: toValue(soc.denomination) },
    { label: "Forme", value: toValue(soc.forme) },
    { label: "Capital social (€)", value: toValue(soc.capital) },
    { label: "Adresse du siège", value: toValue(soc.siege) },
    { label: "Ville RCS", value: toValue(soc.villeRcs) },
    { label: "Numéro RCS / SIREN", value: toValue(soc.numeroRcs) },
    { label: "Téléphone", value: toValue(soc.telephone) },
    { label: "Email", value: toValue(soc.email) },
  ])

  if (soc.representantType === "monsieur" || soc.representantType === "madame") {
    await drawRowsSection(ctx, "Représentant", [
      { label: "Civilité", value: toTitleCase(soc.representantType) },
      { label: "Nom", value: toValue(repPhys.nom) },
      { label: "Prénom", value: toValue(repPhys.prenom) },
      { label: "Fonction", value: toValue(repPhys.fonction) },
      { label: "Base des pouvoirs", value: toValue(repPhys.pouvoirs) },
      { label: "Téléphone", value: toValue(repPhys.telephone) },
      { label: "Email", value: toValue(repPhys.email) },
    ])
  } else if (soc.representantType === "societe") {
    await drawRowsSection(ctx, "Société représentante", [
      { label: "Dénomination", value: toValue(repSoc.denomination) },
      { label: "Forme", value: toValue(repSoc.forme) },
      { label: "Capital (€)", value: toValue(repSoc.capital) },
      { label: "Adresse du siège", value: toValue(repSoc.siege) },
      { label: "Ville RCS", value: toValue(repSoc.villeRcs) },
      { label: "Numéro RCS / SIREN", value: toValue(repSoc.numeroRcs) },
      { label: "Document donnant pouvoir", value: toValue(repSoc.pouvoirs) },
    ])

    await drawRowsSection(ctx, "Représentant de la société", [
      { label: "Civilité", value: toTitleCase(repSoc.representantCivilite) },
      { label: "Nom", value: toValue(repSoc.representantNom) },
      { label: "Prénom", value: toValue(repSoc.representantPrenom) },
      { label: "Fonction", value: toValue(repSoc.representantFonction) },
      { label: "Pouvoirs", value: toValue(repSoc.representantPouvoirs) },
      { label: "Téléphone", value: toValue(repSoc.representantTelephone) },
      { label: "Email", value: toValue(repSoc.representantEmail) },
    ])
  } else if (soc.representantType === "autre") {
    await drawRowsSection(ctx, "Représentant / Signataire", [
      { label: "Description", value: toValue(repAutre.description) },
      { label: "Nom", value: toValue(repAutre.signataireNom) },
      { label: "Prénom", value: toValue(repAutre.signatairePrenom) },
      { label: "Téléphone", value: toValue(repAutre.telephone) },
      { label: "Email", value: toValue(repAutre.email) },
    ])
  }

  if (nonEmpty(soc.precisions)) {
    await drawRowsSection(ctx, "Précisions complémentaires", [{ label: "Précisions", value: toValue(soc.precisions) }])
  }
}

async function drawEI(ctx: DocContext, data: any) {
  const ei = data?.ei || {}
  await drawRowsSection(ctx, "Entreprise individuelle", [
    { label: "Nom", value: toValue(ei.nom) },
    { label: "Prénom", value: toValue(ei.prenom) },
    { label: "Adresse", value: toValue(ei.adresse) },
    { label: "Registre", value: toValue(ei.registre) },
    { label: "Précision registre", value: toValue(ei.registrePrecision) },
    { label: "Numéro RCS / RM", value: toValue(ei.numero) },
    { label: "Code APE communiqué", value: toValue(ei.codeApeChoix) },
    { label: "Code APE", value: toValue(ei.codeApe) },
  ])
}

async function drawAssociation(ctx: DocContext, data: any) {
  const assoc = data?.association || {}
  const repPhys = assoc.representantPhysique || {}
  const repAutre = assoc.representantAutre || {}

  await drawRowsSection(ctx, "Association venderesse", [
    { label: "Dénomination", value: toValue(assoc.denomination) },
    { label: "Adresse du siège", value: toValue(assoc.siege) },
    { label: "Numéro RNA", value: toValue(assoc.numeroRna) },
    { label: "Numéro SIREN", value: toValue(assoc.numeroSiren) },
    { label: "Téléphone", value: toValue(assoc.telephone) },
    { label: "Email", value: toValue(assoc.email) },
  ])

  if (assoc.representantType === "monsieur" || assoc.representantType === "madame") {
    await drawRowsSection(ctx, "Représentant", [
      { label: "Civilité", value: toTitleCase(assoc.representantType) },
      { label: "Nom", value: toValue(repPhys.nom) },
      { label: "Prénom", value: toValue(repPhys.prenom) },
      { label: "Fonction", value: toValue(repPhys.fonction) },
      { label: "Pouvoirs", value: toValue(repPhys.pouvoirs) },
      { label: "Téléphone", value: toValue(repPhys.telephone) },
      { label: "Email", value: toValue(repPhys.email) },
    ])
  } else if (assoc.representantType === "autre") {
    await drawRowsSection(ctx, "Représentant / Signataire", [
      { label: "Description", value: toValue(repAutre.description) },
      { label: "Nom", value: toValue(repAutre.signataireNom) },
      { label: "Prénom", value: toValue(repAutre.signatairePrenom) },
      { label: "Téléphone", value: toValue(repAutre.telephone) },
      { label: "Email", value: toValue(repAutre.email) },
    ])
  }

  if (nonEmpty(assoc.precisions)) {
    await drawRowsSection(ctx, "Précisions complémentaires", [{ label: "Précisions", value: toValue(assoc.precisions) }])
  }
}

async function drawPersonneMorale(ctx: DocContext, data: any) {
  const pm = data?.personneMorale || {}
  const repPhys = pm.representantPhysique || {}
  const repAutre = pm.representantAutre || {}

  await drawRowsSection(ctx, "Personne morale", [
    { label: "Description", value: toValue(pm.description) },
    { label: "Téléphone", value: toValue(pm.telephone) },
    { label: "Email", value: toValue(pm.email) },
  ])

  if (pm.representantType === "monsieur" || pm.representantType === "madame") {
    await drawRowsSection(ctx, "Représentant", [
      { label: "Civilité", value: toTitleCase(pm.representantType) },
      { label: "Nom", value: toValue(repPhys.nom) },
      { label: "Prénom", value: toValue(repPhys.prenom) },
      { label: "Fonction", value: toValue(repPhys.fonction) },
      { label: "Pouvoirs", value: toValue(repPhys.pouvoirs) },
      { label: "Téléphone", value: toValue(repPhys.telephone) },
      { label: "Email", value: toValue(repPhys.email) },
    ])
  } else if (pm.representantType === "autre") {
    await drawRowsSection(ctx, "Représentant / Signataire", [
      { label: "Description", value: toValue(repAutre.description) },
      { label: "Nom", value: toValue(repAutre.signataireNom) },
      { label: "Prénom", value: toValue(repAutre.signatairePrenom) },
      { label: "Téléphone", value: toValue(repAutre.telephone) },
      { label: "Email", value: toValue(repAutre.email) },
    ])
  }

  if (nonEmpty(pm.precisions)) {
    await drawRowsSection(ctx, "Précisions complémentaires", [{ label: "Précisions", value: toValue(pm.precisions) }])
  }
}

async function drawMineur(ctx: DocContext, data: any) {
  const m = data?.mineur || {}
  const mere = m.mere || {}
  const pere = m.pere || {}
  const tuteur = m.tuteur || {}
  const autre = m.autre || {}

  await drawRowsSection(ctx, "Mineur vendeur", [
    { label: "Nom", value: toValue(m.nom) },
    { label: "Prénom", value: toValue(m.prenom) },
    { label: "Date de naissance", value: toValue(m.dateNaissance) },
    { label: "Lieu de naissance", value: toValue(m.lieuNaissance) },
    { label: "Nationalité", value: toValue(m.nationalite) },
    { label: "Adresse", value: toValue(m.adresse) },
    { label: "Autorité / Tutelle", value: toValue(m.autorite) },
  ])

  if (m.autorite === "mere" || m.autorite === "les_deux") {
    await drawRowsSection(ctx, "Mère", [
      { label: "Nom", value: toValue(mere.nom) },
      { label: "Prénom", value: toValue(mere.prenom) },
      { label: "Adresse", value: toValue(mere.adresse) },
      { label: "Téléphone", value: toValue(mere.telephone) },
      { label: "Email", value: toValue(mere.email) },
    ])
  }

  if (m.autorite === "pere" || m.autorite === "les_deux") {
    await drawRowsSection(ctx, "Père", [
      { label: "Nom", value: toValue(pere.nom) },
      { label: "Prénom", value: toValue(pere.prenom) },
      { label: "Adresse", value: toValue(pere.adresse) },
      { label: "Téléphone", value: toValue(pere.telephone) },
      { label: "Email", value: toValue(pere.email) },
    ])
  }

  if (m.autorite === "tuteur") {
    await drawRowsSection(ctx, "Tuteur", [
      { label: "Nom", value: toValue(tuteur.nom) },
      { label: "Prénom", value: toValue(tuteur.prenom) },
      { label: "Tribunal / Ville", value: toValue(tuteur.tribunalVille) },
      { label: "Date de l'ordonnance", value: toValue(tuteur.dateOrdonnance) },
      { label: "Adresse", value: toValue(tuteur.adresse) },
      { label: "Téléphone", value: toValue(tuteur.telephone) },
      { label: "Email", value: toValue(tuteur.email) },
    ])
  }

  if (m.autorite === "autre") {
    await drawRowsSection(ctx, "Autre représentant", [
      { label: "Description", value: toValue(autre.description) },
      { label: "Nom", value: toValue(autre.signataireNom) },
      { label: "Prénom", value: toValue(autre.signatairePrenom) },
      { label: "Téléphone", value: toValue(autre.telephone) },
      { label: "Email", value: toValue(autre.email) },
    ])
  }

  if (nonEmpty(m.precisions)) {
    await drawRowsSection(ctx, "Précisions complémentaires", [{ label: "Précisions", value: toValue(m.precisions) }])
  }
}

async function drawMajeurProtege(ctx: DocContext, data: any) {
  const mp = data?.majeurProtege || {}

  await drawRowsSection(ctx, "Majeur protégé", [
    { label: "Nom", value: toValue(mp.nom) },
    { label: "Prénom", value: toValue(mp.prenom) },
    { label: "Date de naissance", value: toValue(mp.dateNaissance) },
    { label: "Lieu de naissance", value: toValue(mp.lieuNaissance) },
    { label: "Nationalité", value: toValue(mp.nationalite) },
    { label: "Adresse", value: toValue(mp.adresse) },
    { label: "Mesure de protection", value: toValue(mp.mesure) },
    { label: "Détails de la mesure", value: toValue(mp.mesureDetails) },
    { label: "Base juridique", value: toValue(mp.baseJuridique) },
    { label: "Représentant - Nom", value: toValue(mp.representantNom) },
    { label: "Représentant - Prénom", value: toValue(mp.representantPrenom) },
    { label: "Qualité du représentant", value: toValue(mp.representantQualite) },
    { label: "Téléphone", value: toValue(mp.telephone) },
    { label: "Email", value: toValue(mp.email) },
  ])

  if (nonEmpty(mp.precisions)) {
    await drawRowsSection(ctx, "Précisions complémentaires", [{ label: "Précisions", value: toValue(mp.precisions) }])
  }
}

async function drawAutreSituation(ctx: DocContext, data: any) {
  const a = data?.autreSituation || {}
  await drawRowsSection(ctx, "Autre situation", [
    { label: "Description", value: toValue(a.description) },
    { label: "Contact - Nom", value: toValue(a.contactNom) },
    { label: "Contact - Prénom", value: toValue(a.contactPrenom) },
    { label: "Téléphone", value: toValue(a.telephone) },
    { label: "Email", value: toValue(a.email) },
  ])
}

// Filename
export function buildVendeurPdfFilename(data: any): string {
  const names: string[] = []
  if (data?.personne?.nom) names.push(`${toTitleCase(data.personne.prenom || "").trim()} ${toTitleCase(data.personne.nom || "").trim()}`.trim())
  if (data?.couple?.vendeur1?.nom) names.push(`${toTitleCase(data.couple.vendeur1.prenom || "").trim()} ${toTitleCase(data.couple.vendeur1.nom || "").trim()}`.trim())
  if (data?.couple?.vendeur2?.nom) names.push(`${toTitleCase(data.couple.vendeur2.prenom || "").trim()} ${toTitleCase(data.couple.vendeur2.nom || "").trim()}`.trim())
  if (data?.type === "indivision" && Array.isArray(data?.indivision)) {
    data.indivision.forEach((p: any) => {
      if (p?.nom || p?.prenom) {
        names.push(`${toTitleCase(p.prenom || "").trim()} ${toTitleCase(p.nom || "").trim()}`.trim())
      }
    })
  }
  if (data?.type === "societe" && data?.societe?.denomination) names.push(pdfSafe(data.societe.denomination))
  if (data?.type === "entreprise_individuelle" && (data?.ei?.nom || data?.ei?.prenom)) {
    names.push(`${toTitleCase(data.ei.prenom || "").trim()} ${toTitleCase(data.ei.nom || "").trim()}`.trim())
  }
  if (data?.type === "association" && data?.association?.denomination) names.push(pdfSafe(data.association.denomination))
  if (data?.type === "personne_morale_autre" && data?.personneMorale?.description) names.push(pdfSafe(data.personneMorale.description))
  if (data?.type === "mineur" && (data?.mineur?.nom || data?.mineur?.prenom)) {
    names.push(`${toTitleCase(data.mineur.prenom || "").trim()} ${toTitleCase(data.mineur.nom || "").trim()}`.trim())
  }
  if (data?.type === "majeur_protege" && (data?.majeurProtege?.nom || data?.majeurProtege?.prenom)) {
    names.push(`${toTitleCase(data.majeurProtege.prenom || "").trim()} ${toTitleCase(data.majeurProtege.nom || "").trim()}`.trim())
  }
  if (data?.type === "autre" && (data?.autreSituation?.contactNom || data?.autreSituation?.contactPrenom)) {
    names.push(`${toTitleCase(data.autreSituation.contactPrenom || "").trim()} ${toTitleCase(data.autreSituation.contactNom || "").trim()}`.trim())
  }
  const safe = names.map((n) => n.replace(/[\\/:*?"<>|\u0000-\u001F]+/g, "").trim()).filter(Boolean).join("_")
  return `FR-vendeur-${safe || "Vendeur"}.pdf`
}

// Main generator
export async function generateVendeurPdf(data: any): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  // Gestion de la pagination selon le type
  // - Personne seule : 1 page
  // - Couple : 1 page par personne (2 pages)
  
  if (data?.type === "personne_seule") {
    // Une seule page pour la personne seule
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    let y = await drawHeader(page, pdf, fontBold, fontReg)
    y -= 4

    const ctx: DocContext = {
      pdf,
      page,
      y,
      fonts: { reg: fontReg, bold: fontBold },
    }

    await drawSingleLeftAlignedColumnWithBreaks(ctx, data.personne, "Vendeur")
    drawFooter(ctx.page, fontReg)
  } else if (data?.type?.startsWith("couple")) {
    // Deux pages : une par personne
    const vendeur1 = data?.couple?.vendeur1
    const vendeur2 = data?.couple?.vendeur2

    // Page 1 - Vendeur 1
    const page1 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    let y1 = await drawHeader(page1, pdf, fontBold, fontReg)
    y1 -= 4

    const ctx1: DocContext = {
      pdf,
      page: page1,
      y: y1,
      fonts: { reg: fontReg, bold: fontBold },
    }

    const civilite1 = normalizeCivilite(vendeur1?.civilite)
    await drawSingleLeftAlignedColumnWithBreaks(ctx1, vendeur1, `Vendeur 1 - ${civilite1}`)
    drawFooter(ctx1.page, fontReg)

    // Page 2 - Vendeur 2
    const page2 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    let y2 = await drawHeader(page2, pdf, fontBold, fontReg)
    y2 -= 4

    const ctx2: DocContext = {
      pdf,
      page: page2,
      y: y2,
      fonts: { reg: fontReg, bold: fontBold },
    }

    const civilite2 = normalizeCivilite(vendeur2?.civilite)
    await drawSingleLeftAlignedColumnWithBreaks(ctx2, vendeur2, `Vendeur 2 - ${civilite2}`)
    drawFooter(ctx2.page, fontReg)
  } else if (data?.type === "indivision" && Array.isArray(data?.indivision) && data.indivision.length > 0) {
    // Indivision : une page par personne
    const indivisionList = data.indivision.filter((p: any) => p && (p.nom || p.prenom)) // Filtrer les personnes vides
    
    if (indivisionList.length === 0) {
      // Si aucune personne valide, créer une page vide
      const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      let y = await drawHeader(page, pdf, fontBold, fontReg)
      y -= 4
      const ctx: DocContext = {
        pdf,
        page,
        y,
        fonts: { reg: fontReg, bold: fontBold },
      }
      drawFooter(ctx.page, fontReg)
    } else {
      // Créer une page pour chaque personne en indivision
      for (let i = 0; i < indivisionList.length; i++) {
        const personne = indivisionList[i]
        const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        let y = await drawHeader(page, pdf, fontBold, fontReg)
        y -= 4

        const ctx: DocContext = {
          pdf,
          page,
          y,
          fonts: { reg: fontReg, bold: fontBold },
        }

        const civilite = normalizeCivilite(personne?.civilite)
        await drawSingleLeftAlignedColumnWithBreaks(ctx, personne, `Vendeur ${i + 1} - ${civilite}`)
        drawFooter(ctx.page, fontReg)
      }
    }
  } else {
    // Autres types (société, EI, association, personne morale, mineur, majeur protégé, autre)
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    let y = await drawHeader(page, pdf, fontBold, fontReg)
    y -= 4

    const ctx: DocContext = {
      pdf,
      page,
      y,
      fonts: { reg: fontReg, bold: fontBold },
    }

    if (data?.type === "societe") {
      await drawSociete(ctx, data)
    } else if (data?.type === "entreprise_individuelle") {
      await drawEI(ctx, data)
    } else if (data?.type === "association") {
      await drawAssociation(ctx, data)
    } else if (data?.type === "personne_morale_autre") {
      await drawPersonneMorale(ctx, data)
    } else if (data?.type === "mineur") {
      await drawMineur(ctx, data)
    } else if (data?.type === "majeur_protege") {
      await drawMajeurProtege(ctx, data)
    } else if (data?.type === "autre") {
      await drawAutreSituation(ctx, data)
    }

    drawFooter(ctx.page, fontReg)
  }

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}
