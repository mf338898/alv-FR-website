import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { sendMail } from "@/lib/mail"
import { generateVendeurPdf, buildVendeurPdfFilename } from "@/lib/pdf-vendeur-generator"
import {
  extractVendeurPersons,
  generateVendeurCsvBuffer,
  buildVendeurCsvFilename,
} from "@/lib/csv-generator"

const safe = (v?: string | null) => (v && v.trim() ? v.trim() : "-")

function formatDateFR(input?: string | null) {
  if (!input || !input.trim()) return "-"
  const s = input.trim()
  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (dmy) return `${dmy[1].padStart(2, "0")}/${dmy[2].padStart(2, "0")}/${dmy[3]}`
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  return s
}

function formatCivilitePrefix(civilite?: string) {
  const normalized = civilite?.trim().toLowerCase()
  if (normalized === "monsieur") return "M."
  if (normalized === "madame") return "Mme"
  return ""
}

function formatPersonForSubject(person: any) {
  if (!person) return ""
  const civilite = formatCivilitePrefix(person.civilite || person.representantCivilite)
  const prenom = (person.prenom || person.representantPrenom || "").trim()
  const nom = (person.nom || person.representantNom || "").trim().toUpperCase()

  if (civilite && prenom && nom) return `${civilite} ${prenom} ${nom}`
  if (civilite && nom) return `${civilite} ${nom}`
  if (prenom && nom) return `${prenom} ${nom}`
  return [civilite, prenom || nom].filter(Boolean).join(" ").trim()
}

function pickRepresentative(body: any) {
  // Personne seule
  if (body?.type === "personne_seule" && body?.personne) return body.personne

  // Couple (priorité vendeur1)
  if (body?.type?.startsWith("couple")) {
    if (body?.couple?.vendeur1) return body.couple.vendeur1
    if (body?.couple?.vendeur2) return body.couple.vendeur2
  }

  // Indivision : premier déclaré
  if (body?.type === "indivision" && Array.isArray(body?.indivision) && body.indivision.length > 0) {
    return body.indivision[0]
  }

  // Société : représentant physique ou représentant d'une société représentante
  if (body?.type === "societe" && body?.societe) {
    if (body.societe.representantPhysique) return body.societe.representantPhysique
    if (body.societe.representantSociete) return body.societe.representantSociete
  }

  // Entreprise individuelle
  if (body?.type === "entreprise_individuelle" && body?.ei) return body.ei

  // Association
  if (body?.type === "association" && body?.association) {
    if (body.association.representantPhysique) return body.association.representantPhysique
    if (body.association.representantAutre) return body.association.representantAutre
  }

  // Personne morale autre
  if (body?.type === "personne_morale_autre" && body?.personneMorale) {
    if (body.personneMorale.representantPhysique) return body.personneMorale.representantPhysique
    if (body.personneMorale.representantAutre) return body.personneMorale.representantAutre
  }

  // Mineur : priorise mère puis père puis tuteur
  if (body?.type === "mineur" && body?.mineur) {
    const m = body.mineur
    return m.mere || m.pere || m.tuteur || m.autre
  }

  // Majeur protégé : représentant déclaré
  if (body?.type === "majeur_protege" && body?.majeurProtege) {
    const mp = body.majeurProtege
    return {
      civilite: mp.representantCivilite,
      prenom: mp.representantPrenom,
      nom: mp.representantNom,
    }
  }

  // Fallback : premier email collecté ou rien
  return null
}

function buildVendeurSubject(_body: any) {
  return "Accusé de réception — fiche vendeur reçue + documents"
}

function collectEmails(body: any): string[] {
  const emails = new Set<string>()
  const push = (v?: string) => {
    if (v && v.trim()) emails.add(v.trim())
  }
  try {
    if (body?.personne?.email) push(body.personne.email)
    if (body?.couple?.vendeur1?.email) push(body.couple.vendeur1.email)
    if (body?.couple?.vendeur2?.email) push(body.couple.vendeur2.email)
    if (Array.isArray(body?.indivision)) {
      body.indivision.forEach((p: any) => push(p?.email))
    }
    if (body?.societe?.email) push(body.societe.email)
    if (body?.societe?.representantPhysique?.email) push(body.societe.representantPhysique.email)
    if (body?.societe?.representantSociete?.representantEmail) push(body.societe.representantSociete.representantEmail)
    if (body?.association?.email) push(body.association.email)
    if (body?.association?.representantPhysique?.email) push(body.association.representantPhysique.email)
    if (body?.association?.representantAutre?.email) push(body.association.representantAutre.email)
    if (body?.personneMorale?.email) push(body.personneMorale.email)
    if (body?.personneMorale?.representantPhysique?.email) push(body.personneMorale.representantPhysique.email)
    if (body?.personneMorale?.representantAutre?.email) push(body.personneMorale.representantAutre.email)
    if (body?.mineur?.mere?.email) push(body.mineur.mere.email)
    if (body?.mineur?.pere?.email) push(body.mineur.pere.email)
    if (body?.mineur?.tuteur?.email) push(body.mineur.tuteur.email)
    if (body?.mineur?.autre?.email) push(body.mineur.autre.email)
    if (body?.majeurProtege?.email) push(body.majeurProtege.email)
  } catch (e) {
    // ignore
  }
  return Array.from(emails)
}

function formatPersonInfo(p: any, index?: number): string {
  if (!p) return ""
  const parts: string[] = []
  if (p.civilite) parts.push(p.civilite)
  if (p.prenom) parts.push(p.prenom)
  if (p.nom) parts.push(p.nom)
  const name = parts.join(" ").trim()
  
  const info: string[] = []
  if (name) info.push(`<strong>${index ? `Vendeur ${index}` : "Vendeur"} :</strong> ${name}`)
  if (p.email) info.push(`<strong>Email :</strong> ${p.email}`)
  if (p.telephone) info.push(`<strong>Téléphone :</strong> ${p.telephone}`)
  if (p.adresse) info.push(`<strong>Adresse :</strong> ${p.adresse}`)
  if (p.dateNaissance) info.push(`<strong>Date de naissance :</strong> ${formatDateFR(p.dateNaissance)}`)
  if (p.lieuNaissance) info.push(`<strong>Lieu de naissance :</strong> ${p.lieuNaissance}`)
  if (p.nationalite) info.push(`<strong>Nationalité :</strong> ${p.nationalite}`)
  if (p.situationMatrimoniale) info.push(`<strong>Situation matrimoniale :</strong> ${p.situationMatrimoniale}`)
  if (p.notaireDesigne === "oui") {
    const notaire = [p.notaireNom, p.notaireVille].filter(Boolean).join(" à ")
    if (notaire) info.push(`<strong>Notaire désigné :</strong> ${notaire}`)
  }
  
  return info.length > 0 ? `<div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">${info.join("<br />")}</div>` : ""
}

function buildEmailHTML(_data: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: Arial, sans-serif; margin:0; padding:20px; background:#f8fafc;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;">
    <div style="background-color:#fff5f5;border:1px solid #fecdd3;color:#b91c1c;padding:10px 12px;border-radius:6px;margin-bottom:16px;font-weight:600;font-size:13px;">
      ⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.<br />
      Pour toute question, contactez l'agence au 02 98 26 71 47 ou par mail à contact@alvimobilier.bzh.
    </div>
    <h1 style="color:#0072BC;font-size:20px;margin:0 0 12px;">Accusé de réception — fiche de renseignement vendeur</h1>
    <p style="margin:0 0 12px;">Bonjour,</p>
    <p style="margin:0 0 16px;">✅ Nous accusons bonne réception de votre fiche de renseignement vendeur.</p>
    <p style="margin:0 0 8px;">Pour la suite, merci de nous transmettre les documents listés ci-dessous :</p>
    <ul style="margin:0 0 12px 20px;padding:0;">
      <li>Titre de propriété (ou acte notarié)</li>
      <li>Liste des indivisaires (si indivision)</li>
      <li>Pièces d'identité en cours de validité (recto/verso)</li>
      <li>Justificatif de domicile de moins de 3 mois</li>
      <li>Taxe foncière (dernier avis)</li>
      <li>Assainissement (attestation de conformité ou document en cours)</li>
      <li>Diagnostics immobiliers (DPE, amiante, plomb, termites, assainissement selon cas)</li>
      <li>Devis et plans (travaux réalisés ou prévus, si concerné)</li>
    </ul>
    <p style="margin:0 0 12px;font-size:13px;color:#475569;">Si vous nous avez déjà envoyé certains de ces documents, inutile de les renvoyer.</p>
    <p style="margin:0 0 16px;">📩 Envoi : <a href="mailto:contact@alvimobilier.bzh">contact@alvimobilier.bzh</a></p>
    <p style="margin:0 0 4px;">Bien cordialement,</p>
    <p style="margin:0 0 4px;"><strong>ALV Immobilier</strong></p>
    <p style="margin:0 0 4px;font-size:12px;color:#64748b;">SAS ALV IMMOBILIER TRANSACTIONS, LOCATIONS, ADMINISTRATEUR DE BIENS.</p>
    <p style="margin:0 0 4px;font-size:12px;color:#64748b;">19 Place Charles de Gaulle 29190 PLEYBEN</p>
    <p style="margin:0 0 4px;font-size:12px;color:#64748b;">02 98 26 71 47</p>
    <div style="background:#ecfdf3;border:1px solid #bbf7d0;border-radius:6px;padding:10px 12px;margin-top:16px;">
      <p style="margin:0;color:#166534;font-weight:600;">📄 PDF de la fiche vendeur joint</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function formatPersonInfoText(p: any, index?: number): string {
  if (!p) return ""
  const parts: string[] = []
  if (p.civilite) parts.push(p.civilite)
  if (p.prenom) parts.push(p.prenom)
  if (p.nom) parts.push(p.nom)
  const name = parts.join(" ").trim()
  
  const info: string[] = []
  if (name) info.push(`${index ? `Vendeur ${index}` : "Vendeur"} : ${name}`)
  if (p.email) info.push(`Email : ${p.email}`)
  if (p.telephone) info.push(`Téléphone : ${p.telephone}`)
  if (p.adresse) info.push(`Adresse : ${p.adresse}`)
  if (p.dateNaissance) info.push(`Date de naissance : ${formatDateFR(p.dateNaissance)}`)
  if (p.lieuNaissance) info.push(`Lieu de naissance : ${p.lieuNaissance}`)
  if (p.nationalite) info.push(`Nationalité : ${p.nationalite}`)
  if (p.situationMatrimoniale) info.push(`Situation matrimoniale : ${p.situationMatrimoniale}`)
  if (p.notaireDesigne === "oui") {
    const notaire = [p.notaireNom, p.notaireVille].filter(Boolean).join(" à ")
    if (notaire) info.push(`Notaire désigné : ${notaire}`)
  }
  
  return info.length > 0 ? info.join("\n") : ""
}

function buildEmailText(_data: any) {
  return [
    "⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.",
    "Pour toute question, contactez l'agence au 02 98 26 71 47 ou par mail à contact@alvimobilier.bzh.",
    "",
    "Accusé de réception — fiche de renseignement vendeur",
    "",
    "Bonjour,",
    "",
    "✅ Nous accusons bonne réception de votre fiche de renseignement vendeur.",
    "",
    "Pour la suite, merci de nous transmettre les documents listés ci-dessous :",
    "- Titre de propriété (ou acte notarié)",
    "- Liste des indivisaires (si indivision)",
    "- Pièces d'identité en cours de validité (recto/verso)",
    "- Justificatif de domicile de moins de 3 mois",
    "- Taxe foncière (dernier avis)",
    "- Assainissement (attestation de conformité ou document en cours)",
    "- Diagnostics immobiliers (DPE, amiante, plomb, termites, assainissement selon cas)",
    "- Devis et plans (travaux réalisés ou prévus, si concerné)",
    "",
    "Si vous nous avez déjà envoyé certains de ces documents, inutile de les renvoyer.",
    "",
    "📩 Envoi : contact@alvimobilier.bzh",
    "",
    "Bien cordialement,",
    "ALV Immobilier",
    "SAS ALV IMMOBILIER TRANSACTIONS, LOCATIONS, ADMINISTRATEUR DE BIENS.",
    "19 Place Charles de Gaulle 29190 PLEYBEN",
    "02 98 26 71 47",
    "",
    "📄 PDF de la fiche vendeur joint",
  ].join("\n")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info("Génération PDF Vendeur demandée", { type: body?.type, nombreVendeurs: body?.nombreVendeurs })

    const pdfBuffer = await generateVendeurPdf(body)
    const filename = buildVendeurPdfFilename(body)

    // Générer les CSV pour chaque personne physique
    const persons = extractVendeurPersons(body)
    const csvAttachments: Array<{ filename: string; content: Buffer; contentType: string }> = []

    for (let i = 0; i < persons.length; i++) {
      try {
        const csvBuffer = generateVendeurCsvBuffer(persons[i])
        const csvFilename = buildVendeurCsvFilename(persons[i], i)
        csvAttachments.push({
          filename: csvFilename,
          content: csvBuffer,
          contentType: "text/csv",
        })
        logger.info("CSV vendeur généré", { filename: csvFilename, index: i })
      } catch (e: any) {
        logger.error("Erreur génération CSV vendeur", { error: e, index: i })
        // Continuer même si un CSV échoue
      }
    }

    const ccList = collectEmails(body)

    const html = buildEmailHTML(body)
    const text = buildEmailText(body)

    // Préparer toutes les pièces jointes (PDF + CSV)
    const attachments = [
      {
        filename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
      ...csvAttachments,
    ]

    // Envoyer l'email avec les PDFs en pièces jointes
    let mailOk = false
    try {
      mailOk = await sendMail({
        to: process.env.RECIPIENT_EMAIL || "contact@alvimobilier.bzh",
        cc: ccList,
        subject: buildVendeurSubject(body),
        html,
        attachments,
        fromName: "ALV Immobilier",
      })
    } catch (e: any) {
      logger.error("sendMail: exception", e)
      mailOk = false
    }

    if (!mailOk) {
      logger.warn("Email non envoyé (config SMTP absente ou erreur), génération PDF/CSV OK")
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de l'envoi de l'email. Veuillez vérifier la configuration SMTP.",
          emailSent: false,
          pdfGenerated: true,
          filename,
          csvGenerated: csvAttachments.length > 0,
          csvCount: csvAttachments.length,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    logger.info("Email envoyé avec PDF vendeur et CSV", {
      filename,
      csvCount: csvAttachments.length,
      cc: ccList,
    })

    return NextResponse.json({
      success: true,
      message: "Formulaire vendeur envoyé avec succès",
      filename,
      csvGenerated: csvAttachments.length > 0,
      csvCount: csvAttachments.length,
      emailSent: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Erreur lors de la génération PDF Vendeur", { error })
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'envoi du formulaire vendeur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API génération PDF Vendeur - Utilisez POST avec les données du formulaire vendeur",
  })
}
