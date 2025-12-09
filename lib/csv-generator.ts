import type { AppFormData, Locataire } from "./types"

const HEADERS = [
  "cust_ref",
  "cust_gender",
  "cust_prenom",
  "cust_nom",
  "cust_resp_gender",
  "cust_enseigne",
  "cust_fonction",
  "cust_tel1",
  "cust_tel2",
  "cust_tel3",
  "cust_tel4",
  "cust_fax",
  "cust_date_birth",
  "cust_email",
  "cust_adresse",
  "cust_codeposte",
  "cust_city",
  "cust_creation_date",
  "cust_comment",
  "search_type_bien",
  "search_transaction",
  "search_min_surface",
  "search_min_pieces",
  "search_min_chambre",
  "search_cp_ville",
  "search_secteur",
  "search_max_prix",
  "cust_search_comment",
] as const

type Header = (typeof HEADERS)[number]

type LeadRow = Record<Header, string>

function csvEscape(value: string) {
  // Conserver les sauts de ligne pour permettre des commentaires multilignes
  const normalized = (value || "").replace(/\r\n?/g, "\n").trim()
  if (normalized === "") return ""
  const mustQuote = normalized.includes(";") || normalized.includes('"') || normalized.includes("\n")
  if (mustQuote) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return normalized
}

function formatDateFR(input?: string | Date | null) {
  if (!input) return ""
  if (input instanceof Date) {
    const d = input
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }
  const s = String(input).trim()
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return `${iso[3]}/${iso[2]}/${iso[1]}`
  }
  const fr = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/)
  if (fr) {
    const year = fr[3].length === 2 ? `20${fr[3]}` : fr[3]
    return `${fr[1].padStart(2, "0")}/${fr[2].padStart(2, "0")}/${year}`
  }
  return s
}

function normalizePhone(phone?: string | null) {
  const digits = (phone || "").replace(/\D+/g, "")
  if (!digits) return ""
  if (digits.length >= 10) {
    return digits.slice(-10)
  }
  return digits
}

function formatPhoneDotted(phone?: string | null) {
  const digits = normalizePhone(phone)
  if (!digits) return ""
  const padded = digits.padStart(10, "0")
  return padded.replace(/(\d{2})(?=\d)/g, "$1.").replace(/\.$/, "")
}

const GENDER_MAP: Record<string, string> = {
  agence: "Société",
  association: "Association",
  cabinet: "Cabinet",
  consorts: "Consorts",
  fa: "Famille",
  famille: "Famille",
  "fami.": "Famille",
  "famil.": "Famille",
  f: "Madame",
  fm: "Monsieur, Madame",
  m: "Monsieur",
  "m.": "Monsieur",
  madame: "Madame",
  "madame & monsieur": "Monsieur, Madame",
  "madame et monsieur": "Monsieur, Madame",
  "madame, mademoiselle": "Monsieur, Madame",
  "madame, mesdemoiselles": "Monsieur, Madame",
  "madame, messieurs": "Monsieur, Madame",
  "madame, monsieur": "Monsieur, Madame",
  mademoiselle: "Mademoiselle",
  "mademoiselle & monsieur": "Monsieur, Madame",
  "mademoiselle, messieurs": "Monsieur, Madame",
  "mademoiselle, monsieur": "Monsieur, Madame",
  "maitre": "Société",
  "maître": "Société",
  mesdames: "Mesdames",
  mesdemoiselles: "Mademoiselle",
  "mesdemoiselles, messieurs": "Monsieur, Madame",
  messieur: "Messieurs",
  messieurs: "Messieurs",
  mle: "Mademoiselle",
  mlle: "Mademoiselle",
  mm: "Monsieur",
  mme: "Monsieur, Madame",
  monsieur: "Monsieur",
  "monsieur & madame": "Monsieur, Madame",
  "monsieur et madame": "Monsieur, Madame",
  "monsieur ou madame": "Monsieur, Madame",
  "monsieur/madame": "Monsieur, Madame",
  mr: "Monsieur",
  mrs: "Monsieur",
  "office notarial": "Société",
  s: "Société",
  "s.a.": "Société",
  "s.a.r.l.": "Société",
  "s.c.i.": "Société",
  sarl: "Société",
  societe: "Société",
  société: "Société",
  succession: "Succession",
}

const GENDER_OUTPUT_MAP: Record<string, string> = {
  "Monsieur, Madame": "fm",
  Monsieur: "m",
  Madame: "f",
  Mademoiselle: "f",
  Messieurs: "mm",
  Mesdames: "f",
  Société: "Société",
}

function normalizeCiviliteValue(civilite?: string | null) {
  const raw = (civilite || "").trim()
  if (!raw) return ""
  const key = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
  if (GENDER_MAP[key]) return GENDER_MAP[key]
  if (key.includes("&") || key.includes(" et ")) return "Monsieur, Madame"
  if (key.includes("soc")) return "Société"
  if (key.includes("assoc")) return "Association"
  if (key.includes("cabinet")) return "Cabinet"
  if (key.includes("consort")) return "Consorts"
  if (key.includes("fam")) return "Famille"
  if (key.includes("madame")) return "Madame"
  if (key.includes("monsieur") || key.startsWith("m.")) return "Monsieur"
  if (key.includes("mademoiselle") || key.startsWith("mlle")) return "Mademoiselle"
  return raw
}

function householdGender(locataires: Locataire[]) {
  const genders = new Set<string>()
  for (const l of locataires) {
    const g = normalizeCiviliteValue(l.civilite)
    if (g === "Monsieur, Madame") {
      return "Monsieur, Madame"
    }
    if (g) genders.add(g)
  }
  if (genders.has("Monsieur") && genders.has("Madame")) return "Monsieur, Madame"
  if (genders.size === 0) return ""
  return genders.values().next().value || ""
}

function extractAddressParts(adresse?: string | null) {
  const raw = (adresse || "").trim()
  const cpMatch = raw.match(/\b(\d{5})\b/)
  const cp = cpMatch?.[1] || ""
  let city = ""
  if (cpMatch?.index !== undefined) {
    const after = raw.slice(cpMatch.index + 5).replace(/[,;:-]/g, " ").trim()
    if (after) {
      city = after.replace(/\s+/g, " ").trim()
    } else {
      const before = raw.slice(0, cpMatch.index).replace(/[,;:-]/g, " ").trim()
      const parts = before.split(" ")
      city = parts.slice(-2).join(" ").trim()
    }
  }
  const cleanCity = city ? city.toUpperCase() : ""
  const cpVille = cp && cleanCity ? `${cp} ${cleanCity}` : ""
  return { cp, city: cleanCity, cpVille }
}

function parseCpVilleFallback(...inputs: Array<string | undefined | null>) {
  for (const input of inputs) {
    if (!input) continue
    const raw = input.trim()
    const cpMatch = raw.match(/\b(\d{5})\b/)
    if (!cpMatch) continue
    const cp = cpMatch[1]
    // Prendre le reste après le CP comme ville
    const after = raw.slice(raw.indexOf(cp) + cp.length).replace(/[,;:-]/g, " ").trim()
    if (after) {
      return `${cp} ${after.toUpperCase()}`
    }
    // Si rien après, essayer avant
    const before = raw.slice(0, raw.indexOf(cp)).replace(/[,;:-]/g, " ").trim()
    if (before) {
      return `${cp} ${before.toUpperCase()}`
    }
  }
  return ""
}

function detectPropertyType(...inputs: Array<string | undefined | null>) {
  const joined = inputs
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  if (!joined) return ""
  if (joined.includes("maison de maitre") || joined.includes("maison de maître")) return "Maison de maître"
  if (joined.includes("bourgeoise")) return "Maison bourgeoise"
  if (joined.includes("maison de ville")) return "Maison de ville"
  if (joined.includes("maison de pays")) return "Maison de pays"
  if (joined.includes("fermette")) return "Fermette"
  if (joined.includes("ferme")) return "Ferme"
  if (joined.includes("demeure contemporaine")) return "Demeure Contemporaine"
  if (joined.includes("demeure")) return "Demeure"
  if (joined.includes("architecte")) return "Maison d'architecte"
  if (joined.includes("mobil home")) return "Mobil Home"
  if (joined.includes("immeuble")) return "Immeuble de rapport"
  if (joined.includes("pavillon") || joined.includes("maison")) return "maison"
  if (joined.includes("studio") || joined.includes("appartement")) return "appartement"
  if (joined.includes("parking") || joined.includes("garage") || joined.includes("box")) return "parking / box"
  if (joined.includes("terrain")) return "terrain"
  if (joined.includes("local") || joined.includes("bureau") || joined.includes("commerce")) return "local commercial"
  if (joined.includes("peniche") || joined.includes("péniche")) return "péniche"
  if (joined.includes("chambre")) return "chambre"
  if (joined.includes("loft")) return "appartement"
  if (joined.includes("haras")) return "haras"
  if (joined.includes("ecurie") || joined.includes("écurie")) return "ecurie"
  if (joined.includes("equestre")) return "propriété equestre"
  return "maison"
}

function extractSurface(...inputs: Array<string | undefined | null>) {
  for (const input of inputs) {
    if (!input) continue
    const match = input.replace(",", ".").match(/(\d+(?:\.\d+)?)\s?(?:m2|m²|m)/i)
    if (match) return match[1]
  }
  return ""
}

function parseNombreChambres(value?: string | null) {
  if (!value) return 0
  const match = value.match(/\d+/)
  if (match) return Number.parseInt(match[0], 10)
  return 0
}

function buildReference(data: AppFormData) {
  const now = new Date()
  // Référence numérique attendue par AC3 : yyyymmdd + 4 chiffres pseudo-aléatoires
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${ymd}${rand}`
}

function toSafeNumber(value?: string | number | null, fallback: string = "") {
  if (value === null || value === undefined) return fallback
  const s = String(value).trim().replace(/\s+/g, "")
  if (!s) return fallback
  const digits = s.replace(/[^\d.]/g, "")
  return digits || fallback
}

function buildCustomerComment(data: AppFormData) {
  const lines: string[] = []
  const primary = data.locataires?.[0]
  if (primary) {
    const civilite = normalizeCiviliteValue(primary.civilite)
    const identite = [civilite, primary.prenom, primary.nom].filter(Boolean).join(" ").trim()
    const naissanceParts = []
    if (primary.dateNaissance) naissanceParts.push(`Né(e) le ${formatDateFR(primary.dateNaissance)}`)
    if (primary.lieuNaissance) naissanceParts.push(`à ${primary.lieuNaissance}`)
    const naissance = naissanceParts.join(" ")
    const line1 = [identite, naissance].filter(Boolean).join(" - ").trim()
    if (line1) lines.push(line1)

    const proParts = []
    if (primary.profession) proParts.push(primary.profession)
    if (primary.typeContrat) proParts.push(primary.typeContrat)
    if (proParts.length) lines.push(`Profession / Contrat : ${proParts.join(" / ")}`)

    if (primary.situationConjugale) lines.push(`Situation matrimoniale : ${primary.situationConjugale}`)
  }

  const extraTenants = (data.locataires || []).slice(1)
  if (extraTenants.length) {
    const names = extraTenants
      .map((l) => `${l.prenom || ""} ${l.nom || ""}`.trim())
      .filter(Boolean)
      .join(", ")
    if (names) lines.push(`Autres occupants : ${names}`)
  }

  if (data.bienConcerne) lines.push(`Bien concerné : ${data.bienConcerne}`)
  if (data.nombreEnfantsFoyer !== undefined) lines.push(`Enfants : ${data.nombreEnfantsFoyer}`)

  return lines.join("\n")
}

function buildSearchComment(data: AppFormData) {
  const lines: string[] = []
  const { criteresRecherche } = data
  if (criteresRecherche?.raisonDemenagement) lines.push(`Raison du déménagement : ${criteresRecherche.raisonDemenagement}`)
  if (criteresRecherche?.preavisADeposer) lines.push(`Préavis : ${criteresRecherche.preavisADeposer}`)

  // Reporter dans les informations complémentaires les minima saisis
  const rawChambres = parseNombreChambres(criteresRecherche?.nombreChambres)
  if (rawChambres) lines.push(`Nb CH ${rawChambres}`)
  const rawPieces = rawChambres ? Math.max(rawChambres + 1, rawChambres) : 1
  lines.push(`Nb pièces mini ${rawPieces}`)
  lines.push(`Surface mini 1`)

  const primary = data.locataires?.[0]
  const revenusNet = primary?.salaireNet ? formatEuroAmount(primary.salaireNet) : ""
  const revenusComplementaires: string[] = []
  if (primary?.indemnitesChomage) revenusComplementaires.push(`Chômage ${formatEuroAmount(primary.indemnitesChomage)}`)
  if (primary?.aahAllocationsHandicap) revenusComplementaires.push(`AAH ${formatEuroAmount(primary.aahAllocationsHandicap)}`)
  if (primary?.rsa) revenusComplementaires.push(`RSA ${formatEuroAmount(primary.rsa)}`)
  if (primary?.pension) revenusComplementaires.push(`Pension ${formatEuroAmount(primary.pension)}`)
  if (primary?.revenusAutoEntrepreneur) revenusComplementaires.push(`AE ${formatEuroAmount(primary.revenusAutoEntrepreneur)}`)
  if (primary?.aidesAuLogement) revenusComplementaires.push(`Aides logement ${formatEuroAmount(primary.aidesAuLogement)}`)
  if (Array.isArray(primary?.revenusAdditionnels)) {
    for (const r of primary.revenusAdditionnels) {
      if (r?.montant) revenusComplementaires.push(`${r.precision || r.type || "Revenu"} ${formatEuroAmount(r.montant)}`)
    }
  }
  if (primary?.profession || primary?.typeContrat || revenusNet || revenusComplementaires.length) {
    const proParts: string[] = []
    if (primary?.profession) proParts.push(`Profession ${primary.profession}`)
    if (primary?.typeContrat) proParts.push(`Type de contrat ${primary.typeContrat}`)
    const revenusParts = []
    if (revenusNet) revenusParts.push(`Revenus mensuels ${revenusNet}`)
    if (revenusComplementaires.length) revenusParts.push(`Compléments ${revenusComplementaires.join(" | ")}`)
    const proLine = proParts.join(" / ")
    const revenusLine = revenusParts.join(" / ")
    const line = [proLine, revenusLine].filter(Boolean).join(" / ")
    if (line) lines.push(`Situation professionnelle : ${line}`)
  }

  if (primary?.employeurNom) {
    lines.push(`Enseigne : ${primary.employeurNom}`)
  }

  if (data.garanties) {
    const g = data.garanties
    const garantLine = `Garanties : garant familial ${g.garantFamilial || "-"}, Visale ${g.garantieVisale || "-"}${g.precisionGarant ? `, précision ${g.precisionGarant}` : ""}`
    lines.push(garantLine)
  }

  if (criteresRecherche?.informationsComplementaires) lines.push(`Informations complémentaires : ${criteresRecherche.informationsComplementaires}`)
  // Doubler les sauts de ligne pour aérer la lecture
  return lines.join("\n\n")
}

function inferTransaction(data: AppFormData) {
  const haystack = [data.bienConcerne, data.criteresRecherche?.informationsComplementaires]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  if (haystack.includes("vente") || haystack.includes("achat") || haystack.includes("acheter")) return "vente"
  return "location"
}

function formatEuroAmount(value?: string | null) {
  const num = Number(String(value || "").replace(/\s/g, "").replace(",", "."))
  if (!isFinite(num) || Number.isNaN(num)) return ""
  return `${Math.round(num)} €`
}

function buildLocataireSummary(locataire: Locataire, index: number) {
  const parts: string[] = []
  const civilite = normalizeCiviliteValue(locataire.civilite) || "Civilité"
  const identite = [locataire.prenom, locataire.nom].filter(Boolean).join(" ").trim() || "Nom non renseigné"
  parts.push(`${civilite} (${identite})`)

  if (locataire.dateNaissance || locataire.lieuNaissance) {
    parts.push(`Date et lieu de naissance : ${formatDateFR(locataire.dateNaissance)}${locataire.lieuNaissance ? `, ${locataire.lieuNaissance}` : ""}`)
  }
  if (locataire.situationConjugale) parts.push(`Situation familiale : ${locataire.situationConjugale}`)
  if (locataire.typeContrat) parts.push(`Type de contrat / statut : ${locataire.typeContrat}`)
  if (locataire.profession) parts.push(`Profession : ${locataire.profession}`)
  if (locataire.employeurNom) parts.push(`Employeur (nom) : ${locataire.employeurNom}`)

  return parts.join(" | ")
}

function formatPhoneList(...values: Array<string | undefined | null>) {
  const numbers = values
    .map((v) => formatPhoneDotted(v))
    .filter(Boolean)
  return Array.from(new Set(numbers)).join(" / ")
}

function buildRowFromLocataire(locataire: Locataire, data: AppFormData): LeadRow {
  const now = new Date()
  const locatairesArray = Array.isArray(data.locataires) ? data.locataires : []
  const household = householdGender(locatairesArray)
  const normalizedPrimary = normalizeCiviliteValue(locataire.civilite)
  // Si on a un seul locataire, utiliser sa civilité normalisée, sinon utiliser le genre du foyer
  let genderValue = locatairesArray.length === 1 
    ? (normalizedPrimary || "Monsieur")
    : (household || normalizedPrimary || "Monsieur")
  // Ne pas marquer "Société" sauf si la civilité du premier locataire est réellement une société
  if (genderValue === "Société" && normalizedPrimary !== "Société") {
    genderValue = locatairesArray.length > 1 ? "Monsieur, Madame" : (normalizedPrimary || "Monsieur")
  }
  const isSociete = normalizedPrimary === "Société"
  const addressParts = extractAddressParts(locataire.adresseActuelle)
  const searchComment = buildSearchComment(data)
  const searchSecteur = data.criteresRecherche?.secteurSouhaite || addressParts.city
  const rawChambres = parseNombreChambres(data.criteresRecherche?.nombreChambres)
  const chambres = rawChambres || 0
  const minPieces = chambres ? Math.max(chambres + 1, chambres) : 1
  const searchType = detectPropertyType(data.bienConcerne, data.criteresRecherche?.informationsComplementaires)
  const surface = extractSurface(data.bienConcerne, data.criteresRecherche?.informationsComplementaires)
  const searchCpVille =
    addressParts.cpVille ||
    parseCpVilleFallback(data.criteresRecherche?.secteurSouhaite, data.bienConcerne) ||
    ""
  const transaction = inferTransaction(data)
  const searchTypeValue = searchType || "maison"
  const searchSecteurValue = searchSecteur || ""
  const maxPrixValue = toSafeNumber(data.criteresRecherche?.loyerMax || "", "")
  // Pour éviter l'erreur d'import, fournir des valeurs minimales par défaut
  const surfaceValue = "1"
  const minPiecesValue = toSafeNumber(minPieces || 1, "1") || "1"
  const minChambresValue = toSafeNumber(chambres || 1, "1") || "1"

  const telValues = locatairesArray.map((l) => formatPhoneDotted(l.telephone)).filter(Boolean)
  const emailValues = locatairesArray.map((l) => l.email?.trim()).filter(Boolean)
  const prenoms = locatairesArray.map((l) => l.prenom).filter(Boolean)
  const noms = locatairesArray.map((l) => l.nom).filter(Boolean)
  const prenomsJoined = prenoms.join(" / ")
  const nomsJoined = noms.join(" / ")

  const comments: string[] = []
  locatairesArray.forEach((l, idx) => {
    comments.push(buildLocataireSummary(l, idx))
  })
  comments.push(`Nombre d'enfants à charge : ${data.nombreEnfantsFoyer ?? 0}`)
  if (data.garanties) {
    const g = data.garanties
    comments.push(
      `Garanties : garant familial ${g.garantFamilial || "-"}, Visale ${g.garantieVisale || "-"}, précision ${g.precisionGarant || "-"}`
    )
  }

  // Pour cust_resp_gender, utiliser la civilité du premier locataire uniquement
  // Si c'est "Monsieur, Madame", prendre "Monsieur" par défaut pour le responsable
  let respGenderRaw = normalizeCiviliteValue(locataire.civilite) || "Monsieur"
  if (respGenderRaw === "Monsieur, Madame") {
    respGenderRaw = "Monsieur, Madame"
  }
  const respGender = GENDER_OUTPUT_MAP[respGenderRaw] || respGenderRaw

  return {
    cust_ref: buildReference(data),
    cust_gender: GENDER_OUTPUT_MAP[genderValue] || genderValue,
    cust_prenom: prenomsJoined || locataire.prenom || "",
    cust_nom: nomsJoined || locataire.nom || "",
    cust_resp_gender: respGender,
    cust_enseigne: "",
    cust_fonction: isSociete ? (locataire.profession || "") : "",
    cust_tel1: telValues[0] || formatPhoneDotted(locataire.telephone),
    cust_tel2: telValues[1] || "",
    cust_tel3: telValues[2] || "",
    cust_tel4: telValues[3] || "",
    cust_fax: "",
    cust_date_birth: formatDateFR(locataire.dateNaissance),
    cust_email: locataire.email?.trim() || emailValues[0] || "",
    cust_adresse: locatairesArray[0]?.adresseActuelle || locataire.adresseActuelle || "",
    cust_codeposte: extractAddressParts(locatairesArray[0]?.adresseActuelle).cp || addressParts.cp,
    cust_city: extractAddressParts(locatairesArray[0]?.adresseActuelle).city || addressParts.city || "",
    cust_creation_date: formatDateFR(now),
    cust_comment: comments.join(" || "),
    search_type_bien: searchTypeValue,
    search_transaction: transaction,
    search_min_surface: surfaceValue,
    search_min_pieces: minPiecesValue,
    search_min_chambre: minChambresValue,
    search_cp_ville: searchCpVille,
    search_secteur: searchSecteurValue,
    search_max_prix: maxPrixValue,
    cust_search_comment: searchComment,
  }
}

export function buildLeadCsv(data: AppFormData): string {
  if (!data) {
    throw new Error("Données du formulaire manquantes pour la génération du CSV.")
  }
  if (!Array.isArray(data.locataires) || data.locataires.length === 0) {
    throw new Error("Aucun locataire fourni pour la génération du CSV.")
  }
  const locataire = data.locataires[0]
  if (!locataire) {
    throw new Error("Le premier locataire est invalide pour la génération du CSV.")
  }

  const rows: LeadRow[] = [buildRowFromLocataire(locataire, data)]
  const csvLines = [
    HEADERS.join(";"),
    ...rows.map((row) => HEADERS.map((h) => csvEscape(row[h])).join(";")),
  ]
  return `${csvLines.join("\n")}\n`
}

export function generateLeadCsvBuffer(data: AppFormData): Buffer {
  const csv = buildLeadCsv(data)
  return Buffer.from(csv, "utf-8")
}

export function buildLeadCsvFilename(data: AppFormData): string {
  const primary = data.locataires?.[0]
  const name = [primary?.nom, primary?.prenom].filter(Boolean).join("-") || "lead"
  const safe = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|\u0000-\u001F]+/g, "")
    .replace(/\s+/g, "_")
  return `Lead-${safe}.csv`
}

// Types pour les vendeurs
interface PersonneSeller {
  civilite: "Monsieur" | "Madame" | ""
  nom: string
  prenom: string
  dateNaissance: string
  lieuNaissance: string
  nationalite: string
  adresse: string
  telephone: string
  email: string
  [key: string]: any // Pour permettre d'autres propriétés optionnelles
}

// Fonction pour extraire toutes les personnes physiques d'un formulaire vendeur
export function extractVendeurPersons(body: any): PersonneSeller[] {
  const persons: PersonneSeller[] = []

  if (!body || !body.type) {
    return persons
  }

  const type = body.type

  // Personne seule
  if (type === "personne_seule" && body.personne) {
    if (body.personne.nom || body.personne.prenom) {
      persons.push(body.personne)
    }
  }

  // Couple
  if (type?.startsWith("couple") && body.couple) {
    if (body.couple.vendeur1 && (body.couple.vendeur1.nom || body.couple.vendeur1.prenom)) {
      persons.push(body.couple.vendeur1)
    }
    if (body.couple.vendeur2 && (body.couple.vendeur2.nom || body.couple.vendeur2.prenom)) {
      persons.push(body.couple.vendeur2)
    }
  }

  // Indivision
  if (type === "indivision" && Array.isArray(body.indivision)) {
    // Filtrer selon vendeursARemplir si présent
    const vendeursARemplir = body.vendeursARemplir || []
    body.indivision.forEach((p: PersonneSeller, idx: number) => {
      const shouldInclude = idx === 0 || (vendeursARemplir[idx] === true)
      if (shouldInclude && p && (p.nom || p.prenom)) {
        persons.push(p)
      }
    })
  }

  // Société - représentant physique
  if (type === "societe" && body.societe) {
    if (body.societe.representantType === "monsieur" || body.societe.representantType === "madame") {
      const rep = body.societe.representantPhysique
      if (rep && (rep.nom || rep.prenom)) {
        persons.push({
          civilite: body.societe.representantType === "monsieur" ? "Monsieur" : "Madame",
          nom: rep.nom || "",
          prenom: rep.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
    // Représentant société - représentant physique de la société représentante
    if (body.societe.representantType === "societe" && body.societe.representantSociete) {
      const rep = body.societe.representantSociete
      if (rep && (rep.representantNom || rep.representantPrenom)) {
        persons.push({
          civilite: rep.representantCivilite === "monsieur" ? "Monsieur" : rep.representantCivilite === "madame" ? "Madame" : "",
          nom: rep.representantNom || "",
          prenom: rep.representantPrenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.representantTelephone || "",
          email: rep.representantEmail || "",
        })
      }
    }
    // Représentant autre
    if (body.societe.representantType === "autre" && body.societe.representantAutre) {
      const rep = body.societe.representantAutre
      if (rep && (rep.signataireNom || rep.signatairePrenom)) {
        persons.push({
          civilite: "",
          nom: rep.signataireNom || "",
          prenom: rep.signatairePrenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
  }

  // Entreprise individuelle
  if (type === "entreprise_individuelle" && body.ei) {
    if (body.ei.nom || body.ei.prenom) {
      persons.push({
        civilite: "",
        nom: body.ei.nom || "",
        prenom: body.ei.prenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: body.ei.adresse || "",
        telephone: "",
        email: "",
      })
    }
  }

  // Association - représentant physique
  if (type === "association" && body.association) {
    if (body.association.representantType === "monsieur" || body.association.representantType === "madame") {
      const rep = body.association.representantPhysique
      if (rep && (rep.nom || rep.prenom)) {
        persons.push({
          civilite: body.association.representantType === "monsieur" ? "Monsieur" : "Madame",
          nom: rep.nom || "",
          prenom: rep.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
    // Représentant autre
    if (body.association.representantType === "autre" && body.association.representantAutre) {
      const rep = body.association.representantAutre
      if (rep && (rep.signataireNom || rep.signatairePrenom)) {
        persons.push({
          civilite: "",
          nom: rep.signataireNom || "",
          prenom: rep.signatairePrenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
  }

  // Personne morale autre - représentant physique
  if (type === "personne_morale_autre" && body.personneMorale) {
    if (body.personneMorale.representantType === "monsieur" || body.personneMorale.representantType === "madame") {
      const rep = body.personneMorale.representantPhysique
      if (rep && (rep.nom || rep.prenom)) {
        persons.push({
          civilite: body.personneMorale.representantType === "monsieur" ? "Monsieur" : "Madame",
          nom: rep.nom || "",
          prenom: rep.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
    // Représentant autre
    if (body.personneMorale.representantType === "autre" && body.personneMorale.representantAutre) {
      const rep = body.personneMorale.representantAutre
      if (rep && (rep.signataireNom || rep.signatairePrenom)) {
        persons.push({
          civilite: "",
          nom: rep.signataireNom || "",
          prenom: rep.signatairePrenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
  }

  // Mineur - selon autorité
  if (type === "mineur" && body.mineur) {
    const autorite = body.mineur.autorite
    if (autorite === "mere" && body.mineur.mere && (body.mineur.mere.nom || body.mineur.mere.prenom)) {
      persons.push({
        civilite: "Madame",
        nom: body.mineur.mere.nom || "",
        prenom: body.mineur.mere.prenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: body.mineur.mere.adresse || "",
        telephone: body.mineur.mere.telephone || "",
        email: body.mineur.mere.email || "",
      })
    }
    if (autorite === "pere" && body.mineur.pere && (body.mineur.pere.nom || body.mineur.pere.prenom)) {
      persons.push({
        civilite: "Monsieur",
        nom: body.mineur.pere.nom || "",
        prenom: body.mineur.pere.prenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: body.mineur.pere.adresse || "",
        telephone: body.mineur.pere.telephone || "",
        email: body.mineur.pere.email || "",
      })
    }
    if (autorite === "les_deux") {
      if (body.mineur.mere && (body.mineur.mere.nom || body.mineur.mere.prenom)) {
        persons.push({
          civilite: "Madame",
          nom: body.mineur.mere.nom || "",
          prenom: body.mineur.mere.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: body.mineur.mere.adresse || "",
          telephone: body.mineur.mere.telephone || "",
          email: body.mineur.mere.email || "",
        })
      }
      if (body.mineur.pere && (body.mineur.pere.nom || body.mineur.pere.prenom)) {
        persons.push({
          civilite: "Monsieur",
          nom: body.mineur.pere.nom || "",
          prenom: body.mineur.pere.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: body.mineur.pere.adresse || "",
          telephone: body.mineur.pere.telephone || "",
          email: body.mineur.pere.email || "",
        })
      }
    }
    if (autorite === "tuteur" && body.mineur.tuteur && (body.mineur.tuteur.nom || body.mineur.tuteur.prenom)) {
      persons.push({
        civilite: "",
        nom: body.mineur.tuteur.nom || "",
        prenom: body.mineur.tuteur.prenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: body.mineur.tuteur.adresse || "",
        telephone: body.mineur.tuteur.telephone || "",
        email: body.mineur.tuteur.email || "",
      })
    }
    if (autorite === "autre" && body.mineur.autre && (body.mineur.autre.signataireNom || body.mineur.autre.signatairePrenom)) {
      persons.push({
        civilite: "",
        nom: body.mineur.autre.signataireNom || "",
        prenom: body.mineur.autre.signatairePrenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: "",
        telephone: body.mineur.autre.telephone || "",
        email: body.mineur.autre.email || "",
      })
    }
  }

  // Majeur protégé
  if (type === "majeur_protege" && body.majeurProtege) {
    const mp = body.majeurProtege
    if (mp.nom || mp.prenom) {
      persons.push({
        civilite: "",
        nom: mp.nom || "",
        prenom: mp.prenom || "",
        dateNaissance: mp.dateNaissance || "",
        lieuNaissance: mp.lieuNaissance || "",
        nationalite: mp.nationalite || "",
        adresse: mp.adresse || "",
        telephone: mp.telephone || "",
        email: mp.email || "",
      })
    }
  }

  // Autre situation
  if (type === "autre" && body.autreSituation) {
    const a = body.autreSituation
    if (a.contactNom || a.contactPrenom) {
      persons.push({
        civilite: "",
        nom: a.contactNom || "",
        prenom: a.contactPrenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: "",
        telephone: a.telephone || "",
        email: a.email || "",
      })
    }
  }

  return persons
}

// Fonction pour construire une ligne CSV à partir d'une PersonneSeller
function buildVendeurCsvRow(person: PersonneSeller): LeadRow {
  const now = new Date()
  const normalizedCivilite = normalizeCiviliteValue(person.civilite)
  const genderValue = normalizedCivilite || "Monsieur"
  const addressParts = extractAddressParts(person.adresse)

  // Construire un commentaire simple pour le vendeur
  const comments: string[] = []
  const identite = [normalizedCivilite, person.prenom, person.nom].filter(Boolean).join(" ").trim()
  if (identite) comments.push(identite)
  if (person.dateNaissance) {
    comments.push(`Né(e) le ${formatDateFR(person.dateNaissance)}`)
  }
  if (person.lieuNaissance) {
    comments.push(`à ${person.lieuNaissance}`)
  }
  if (person.nationalite) {
    comments.push(`Nationalité : ${person.nationalite}`)
  }

  const respGender = GENDER_OUTPUT_MAP[normalizedCivilite] || normalizedCivilite || "m"

  return {
    cust_ref: buildVendeurReference(),
    cust_gender: GENDER_OUTPUT_MAP[genderValue] || genderValue,
    cust_prenom: person.prenom || "",
    cust_nom: person.nom || "",
    cust_resp_gender: respGender,
    cust_enseigne: "",
    cust_fonction: "",
    cust_tel1: formatPhoneDotted(person.telephone),
    cust_tel2: "",
    cust_tel3: "",
    cust_tel4: "",
    cust_fax: "",
    cust_date_birth: formatDateFR(person.dateNaissance),
    cust_email: person.email?.trim() || "",
    cust_adresse: person.adresse || "",
    cust_codeposte: addressParts.cp,
    cust_city: addressParts.city,
    cust_creation_date: formatDateFR(now),
    cust_comment: comments.join(" || "),
    search_type_bien: "",
    search_transaction: "",
    search_min_surface: "1",
    search_min_pieces: "1",
    search_min_chambre: "1",
    search_cp_ville: "",
    search_secteur: "",
    search_max_prix: "999999",
    cust_search_comment: "",
  }
}

// Fonction pour générer une référence unique pour vendeur
function buildVendeurReference(): string {
  const now = new Date()
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${ymd}${rand}`
}

// Fonction pour générer le CSV pour une personne vendeur
export function buildVendeurCsv(person: PersonneSeller): string {
  if (!person) {
    throw new Error("Personne vendeur manquante pour la génération du CSV.")
  }

  const rows: LeadRow[] = [buildVendeurCsvRow(person)]
  const csvLines = [
    HEADERS.join(";"),
    ...rows.map((row) => HEADERS.map((h) => csvEscape(row[h])).join(";")),
  ]
  return `${csvLines.join("\n")}\n`
}

// Fonction pour générer le buffer CSV
export function generateVendeurCsvBuffer(person: PersonneSeller): Buffer {
  const csv = buildVendeurCsv(person)
  return Buffer.from(csv, "utf-8")
}

// Fonction pour générer le nom de fichier CSV
export function buildVendeurCsvFilename(person: PersonneSeller, index?: number): string {
  const name = [person.nom, person.prenom].filter(Boolean).join("-") || `vendeur${index !== undefined ? `-${index + 1}` : ""}`
  const safe = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|\u0000-\u001F]+/g, "")
    .replace(/\s+/g, "_")
  return `Vendeur-${safe}.csv`
}

// Types pour les acquéreurs (identique aux vendeurs)
type PersonneBuyer = PersonneSeller

// Fonction pour extraire toutes les personnes physiques d'un formulaire acquéreur
export function extractAcquereurPersons(body: any): PersonneBuyer[] {
  const persons: PersonneBuyer[] = []

  if (!body || !body.type) {
    return persons
  }

  const type = body.type

  // Personne seule
  if (type === "personne_seule" && body.personne) {
    if (body.personne.nom || body.personne.prenom) {
      persons.push(body.personne)
    }
  }

  // Couple
  if (type?.startsWith("couple") && body.couple) {
    if (body.couple.vendeur1 && (body.couple.vendeur1.nom || body.couple.vendeur1.prenom)) {
      persons.push(body.couple.vendeur1)
    }
    if (body.couple.vendeur2 && (body.couple.vendeur2.nom || body.couple.vendeur2.prenom)) {
      persons.push(body.couple.vendeur2)
    }
  }

  // Indivision
  if (type === "indivision" && Array.isArray(body.indivision)) {
    // Filtrer selon vendeursARemplir si présent (même structure que vendeur)
    const vendeursARemplir = body.vendeursARemplir || []
    body.indivision.forEach((p: PersonneBuyer, idx: number) => {
      const shouldInclude = idx === 0 || (vendeursARemplir[idx] === true)
      if (shouldInclude && p && (p.nom || p.prenom)) {
        persons.push(p)
      }
    })
  }

  // Société - représentant physique
  if (type === "societe" && body.societe) {
    if (body.societe.representantType === "monsieur" || body.societe.representantType === "madame") {
      const rep = body.societe.representantPhysique
      if (rep && (rep.nom || rep.prenom)) {
        persons.push({
          civilite: body.societe.representantType === "monsieur" ? "Monsieur" : "Madame",
          nom: rep.nom || "",
          prenom: rep.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
    // Représentant société - représentant physique de la société représentante
    if (body.societe.representantType === "societe" && body.societe.representantSociete) {
      const rep = body.societe.representantSociete
      if (rep && (rep.representantNom || rep.representantPrenom)) {
        persons.push({
          civilite: rep.representantCivilite === "monsieur" ? "Monsieur" : rep.representantCivilite === "madame" ? "Madame" : "",
          nom: rep.representantNom || "",
          prenom: rep.representantPrenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.representantTelephone || "",
          email: rep.representantEmail || "",
        })
      }
    }
    // Représentant autre
    if (body.societe.representantType === "autre" && body.societe.representantAutre) {
      const rep = body.societe.representantAutre
      if (rep && (rep.signataireNom || rep.signatairePrenom)) {
        persons.push({
          civilite: "",
          nom: rep.signataireNom || "",
          prenom: rep.signatairePrenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
  }

  // Entreprise individuelle
  if (type === "entreprise_individuelle" && body.ei) {
    if (body.ei.nom || body.ei.prenom) {
      persons.push({
        civilite: "",
        nom: body.ei.nom || "",
        prenom: body.ei.prenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: body.ei.adresse || "",
        telephone: "",
        email: "",
      })
    }
  }

  // Association - représentant physique
  if (type === "association" && body.association) {
    if (body.association.representantType === "monsieur" || body.association.representantType === "madame") {
      const rep = body.association.representantPhysique
      if (rep && (rep.nom || rep.prenom)) {
        persons.push({
          civilite: body.association.representantType === "monsieur" ? "Monsieur" : "Madame",
          nom: rep.nom || "",
          prenom: rep.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
    // Représentant autre
    if (body.association.representantType === "autre" && body.association.representantAutre) {
      const rep = body.association.representantAutre
      if (rep && (rep.signataireNom || rep.signatairePrenom)) {
        persons.push({
          civilite: "",
          nom: rep.signataireNom || "",
          prenom: rep.signatairePrenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
  }

  // Personne morale autre - représentant physique
  if (type === "personne_morale_autre" && body.personneMorale) {
    if (body.personneMorale.representantType === "monsieur" || body.personneMorale.representantType === "madame") {
      const rep = body.personneMorale.representantPhysique
      if (rep && (rep.nom || rep.prenom)) {
        persons.push({
          civilite: body.personneMorale.representantType === "monsieur" ? "Monsieur" : "Madame",
          nom: rep.nom || "",
          prenom: rep.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
    // Représentant autre
    if (body.personneMorale.representantType === "autre" && body.personneMorale.representantAutre) {
      const rep = body.personneMorale.representantAutre
      if (rep && (rep.signataireNom || rep.signatairePrenom)) {
        persons.push({
          civilite: "",
          nom: rep.signataireNom || "",
          prenom: rep.signatairePrenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          telephone: rep.telephone || "",
          email: rep.email || "",
        })
      }
    }
  }

  // Mineur - selon autorité
  if (type === "mineur" && body.mineur) {
    const autorite = body.mineur.autorite
    if (autorite === "mere" && body.mineur.mere && (body.mineur.mere.nom || body.mineur.mere.prenom)) {
      persons.push({
        civilite: "Madame",
        nom: body.mineur.mere.nom || "",
        prenom: body.mineur.mere.prenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: body.mineur.mere.adresse || "",
        telephone: body.mineur.mere.telephone || "",
        email: body.mineur.mere.email || "",
      })
    }
    if (autorite === "pere" && body.mineur.pere && (body.mineur.pere.nom || body.mineur.pere.prenom)) {
      persons.push({
        civilite: "Monsieur",
        nom: body.mineur.pere.nom || "",
        prenom: body.mineur.pere.prenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: body.mineur.pere.adresse || "",
        telephone: body.mineur.pere.telephone || "",
        email: body.mineur.pere.email || "",
      })
    }
    if (autorite === "les_deux") {
      if (body.mineur.mere && (body.mineur.mere.nom || body.mineur.mere.prenom)) {
        persons.push({
          civilite: "Madame",
          nom: body.mineur.mere.nom || "",
          prenom: body.mineur.mere.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: body.mineur.mere.adresse || "",
          telephone: body.mineur.mere.telephone || "",
          email: body.mineur.mere.email || "",
        })
      }
      if (body.mineur.pere && (body.mineur.pere.nom || body.mineur.pere.prenom)) {
        persons.push({
          civilite: "Monsieur",
          nom: body.mineur.pere.nom || "",
          prenom: body.mineur.pere.prenom || "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: body.mineur.pere.adresse || "",
          telephone: body.mineur.pere.telephone || "",
          email: body.mineur.pere.email || "",
        })
      }
    }
    if (autorite === "tuteur" && body.mineur.tuteur && (body.mineur.tuteur.nom || body.mineur.tuteur.prenom)) {
      persons.push({
        civilite: "",
        nom: body.mineur.tuteur.nom || "",
        prenom: body.mineur.tuteur.prenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: body.mineur.tuteur.adresse || "",
        telephone: body.mineur.tuteur.telephone || "",
        email: body.mineur.tuteur.email || "",
      })
    }
    if (autorite === "autre" && body.mineur.autre && (body.mineur.autre.signataireNom || body.mineur.autre.signatairePrenom)) {
      persons.push({
        civilite: "",
        nom: body.mineur.autre.signataireNom || "",
        prenom: body.mineur.autre.signatairePrenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: "",
        telephone: body.mineur.autre.telephone || "",
        email: body.mineur.autre.email || "",
      })
    }
  }

  // Majeur protégé
  if (type === "majeur_protege" && body.majeurProtege) {
    const mp = body.majeurProtege
    if (mp.nom || mp.prenom) {
      persons.push({
        civilite: "",
        nom: mp.nom || "",
        prenom: mp.prenom || "",
        dateNaissance: mp.dateNaissance || "",
        lieuNaissance: mp.lieuNaissance || "",
        nationalite: mp.nationalite || "",
        adresse: mp.adresse || "",
        telephone: mp.telephone || "",
        email: mp.email || "",
      })
    }
  }

  // Autre situation
  if (type === "autre" && body.autreSituation) {
    const a = body.autreSituation
    if (a.contactNom || a.contactPrenom) {
      persons.push({
        civilite: "",
        nom: a.contactNom || "",
        prenom: a.contactPrenom || "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "",
        adresse: "",
        telephone: a.telephone || "",
        email: a.email || "",
      })
    }
  }

  return persons
}

// Fonction pour construire une ligne CSV à partir d'une PersonneBuyer
function buildAcquereurCsvRow(person: PersonneBuyer): LeadRow {
  const now = new Date()
  const normalizedCivilite = normalizeCiviliteValue(person.civilite)
  const genderValue = normalizedCivilite || "Monsieur"
  const addressParts = extractAddressParts(person.adresse)

  // Construire un commentaire simple pour l'acquéreur
  const comments: string[] = []
  const identite = [normalizedCivilite, person.prenom, person.nom].filter(Boolean).join(" ").trim()
  if (identite) comments.push(identite)
  if (person.dateNaissance) {
    comments.push(`Né(e) le ${formatDateFR(person.dateNaissance)}`)
  }
  if (person.lieuNaissance) {
    comments.push(`à ${person.lieuNaissance}`)
  }
  if (person.nationalite) {
    comments.push(`Nationalité : ${person.nationalite}`)
  }

  const respGender = GENDER_OUTPUT_MAP[normalizedCivilite] || normalizedCivilite || "m"

  return {
    cust_ref: buildAcquereurReference(),
    cust_gender: GENDER_OUTPUT_MAP[genderValue] || genderValue,
    cust_prenom: person.prenom || "",
    cust_nom: person.nom || "",
    cust_resp_gender: respGender,
    cust_enseigne: "",
    cust_fonction: "",
    cust_tel1: formatPhoneDotted(person.telephone),
    cust_tel2: "",
    cust_tel3: "",
    cust_tel4: "",
    cust_fax: "",
    cust_date_birth: formatDateFR(person.dateNaissance),
    cust_email: person.email?.trim() || "",
    cust_adresse: person.adresse || "",
    cust_codeposte: addressParts.cp,
    cust_city: addressParts.city,
    cust_creation_date: formatDateFR(now),
    cust_comment: comments.join(" || "),
    search_type_bien: "",
    search_transaction: "",
    search_min_surface: "1",
    search_min_pieces: "1",
    search_min_chambre: "1",
    search_cp_ville: "",
    search_secteur: "",
    search_max_prix: "999999",
    cust_search_comment: "",
  }
}

// Fonction pour générer une référence unique pour acquéreur
function buildAcquereurReference(): string {
  const now = new Date()
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${ymd}${rand}`
}

// Fonction pour générer le CSV pour une personne acquéreur
export function buildAcquereurCsv(person: PersonneBuyer): string {
  if (!person) {
    throw new Error("Personne acquéreur manquante pour la génération du CSV.")
  }

  const rows: LeadRow[] = [buildAcquereurCsvRow(person)]
  const csvLines = [
    HEADERS.join(";"),
    ...rows.map((row) => HEADERS.map((h) => csvEscape(row[h])).join(";")),
  ]
  return `${csvLines.join("\n")}\n`
}

// Fonction pour générer le buffer CSV
export function generateAcquereurCsvBuffer(person: PersonneBuyer): Buffer {
  const csv = buildAcquereurCsv(person)
  return Buffer.from(csv, "utf-8")
}

// Fonction pour générer le nom de fichier CSV
export function buildAcquereurCsvFilename(person: PersonneBuyer, index?: number): string {
  const name = [person.nom, person.prenom].filter(Boolean).join("-") || `acquereur${index !== undefined ? `-${index + 1}` : ""}`
  const safe = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|\u0000-\u001F]+/g, "")
    .replace(/\s+/g, "_")
  return `Acquereur-${safe}.csv`
}
