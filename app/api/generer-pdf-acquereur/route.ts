import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { sendMail } from "@/lib/mail"
import { generateAcquereurPdf, buildAcquereurPdfFilename } from "@/lib/pdf-acquereur-generator"
import {
  extractAcquereurPersons,
  generateAcquereurCsvBuffer,
  buildAcquereurCsvFilename,
} from "@/lib/csv-generator"

const safe = (v?: string | null) => (v && v.trim() ? v.trim() : "-")

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

function buildAcquereurSubject(body: any) {
  const typeLabel = body?.type || "acquéreur"
  const representative = pickRepresentative(body)
  const personLabel = formatPersonForSubject(representative)

  if (personLabel) return `Nouveau formulaire acquéreur - ${typeLabel} / ${personLabel}`
  return `Nouveau formulaire acquéreur - ${typeLabel}`
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
  if (name) info.push(`<strong>${index ? `Acquéreur ${index}` : "Acquéreur"} :</strong> ${name}`)
  if (p.email) info.push(`<strong>Email :</strong> ${p.email}`)
  if (p.telephone) info.push(`<strong>Téléphone :</strong> ${p.telephone}`)
  if (p.adresse) info.push(`<strong>Adresse :</strong> ${p.adresse}`)
  if (p.dateNaissance) info.push(`<strong>Date de naissance :</strong> ${p.dateNaissance}`)
  if (p.lieuNaissance) info.push(`<strong>Lieu de naissance :</strong> ${p.lieuNaissance}`)
  if (p.nationalite) info.push(`<strong>Nationalité :</strong> ${p.nationalite}`)
  if (p.situationMatrimoniale) info.push(`<strong>Situation matrimoniale :</strong> ${p.situationMatrimoniale}`)
  if (p.notaireDesigne === "oui") {
    const notaire = [p.notaireNom, p.notaireVille].filter(Boolean).join(" à ")
    if (notaire) info.push(`<strong>Notaire désigné :</strong> ${notaire}`)
  }
  
  return info.length > 0 ? `<div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">${info.join("<br />")}</div>` : ""
}

function buildEmailHTML(data: any) {
  const title = "Nouveau formulaire acquéreur"
  const hasValue = (v?: string | number | null) => Boolean(v !== undefined && v !== null && String(v).trim() !== "")
  
  let contentHTML = ""
  
  // Informations générales
  contentHTML += `<div style="background:#f0f9ff;border-left:4px solid #0072BC;padding:12px 14px;border-radius:6px;margin-bottom:16px;">
    <p style="margin:4px 0;"><strong>Type d'acquéreur :</strong> ${data?.type || "non précisé"}</p>
    <p style="margin:4px 0;"><strong>Nombre d'acquéreurs déclarés :</strong> ${data?.nombreVendeurs || "-"}</p>
  </div>`

  contentHTML += `<div style="background:#ecfdf3;border:1px solid #bbf7d0;color:#166534;padding:10px 12px;border-radius:6px;margin-bottom:16px;font-size:13px;line-height:1.5;">
    Merci d’envoyer les copies de vos pièces d’identité directement à l’agence à l’adresse <strong>contact@alvimobilier.bzh</strong>.<br />
    Ne répondez pas au mail automatique qui vous transmet cette fiche de renseignements.
  </div>`
  
  // Personne seule
  if (data?.type === "personne_seule" && data?.personne) {
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Personne seule</h2>
      ${formatPersonInfo(data.personne)}
    </div>`
  }
  
  // Couple
  if (data?.type?.startsWith("couple")) {
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Couple</h2>
      ${data?.couple?.vendeur1 ? formatPersonInfo(data.couple.vendeur1, 1) : ""}
      ${data?.couple?.vendeur2 ? formatPersonInfo(data.couple.vendeur2, 2) : ""}
    </div>`
  }
  
  // Indivision
  if (data?.type === "indivision" && Array.isArray(data?.indivision)) {
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Indivision (${data.indivision.length} acquéreur(s))</h2>
      ${data.indivision.map((p: any, i: number) => formatPersonInfo(p, i + 1)).join("")}
    </div>`
  }

  // Société
  if (data?.type === "societe" && data?.societe) {
    const s = data.societe
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Société</h2>
      <div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">
        <strong>Dénomination :</strong> ${safe(s.denomination)}<br />
        <strong>Forme :</strong> ${safe(s.forme)}<br />
        <strong>Capital :</strong> ${safe(s.capital)} €<br />
        <strong>Siège :</strong> ${safe(s.siege)}<br />
        <strong>RCS :</strong> ${safe(s.villeRcs)} / ${safe(s.numeroRcs)}<br />
        <strong>Téléphone :</strong> ${safe(s.telephone)}<br />
        <strong>Email :</strong> ${safe(s.email)}
      </div>
    </div>`
  }

  // Entreprise individuelle
  if (data?.type === "entreprise_individuelle" && data?.ei) {
    const ei = data.ei
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Entreprise individuelle</h2>
      <div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">
        <strong>Nom :</strong> ${safe(ei.nom)} ${safe(ei.prenom)}<br />
        <strong>Adresse :</strong> ${safe(ei.adresse)}<br />
        <strong>Registre :</strong> ${safe(ei.registre)} ${safe(ei.registrePrecision)}<br />
        <strong>Numéro :</strong> ${safe(ei.numero)}<br />
        <strong>Code APE :</strong> ${safe(ei.codeApe)}
      </div>
    </div>`
  }

  // Association
  if (data?.type === "association" && data?.association) {
    const a = data.association
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Association</h2>
      <div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">
        <strong>Dénomination :</strong> ${safe(a.denomination)}<br />
        <strong>Siège :</strong> ${safe(a.siege)}<br />
        <strong>RNA :</strong> ${safe(a.numeroRna)} – SIREN : ${safe(a.numeroSiren)}<br />
        <strong>Téléphone :</strong> ${safe(a.telephone)}<br />
        <strong>Email :</strong> ${safe(a.email)}
      </div>
    </div>`
  }

  // Personne morale autre
  if (data?.type === "personne_morale_autre" && data?.personneMorale) {
    const pm = data.personneMorale
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Autre personne morale</h2>
      <div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">
        <strong>Description :</strong> ${safe(pm.description)}<br />
        <strong>Téléphone :</strong> ${safe(pm.telephone)}<br />
        <strong>Email :</strong> ${safe(pm.email)}
      </div>
    </div>`
  }

  // Mineur
  if (data?.type === "mineur" && data?.mineur) {
    const m = data.mineur
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Mineur</h2>
      <div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">
        <strong>Nom :</strong> ${safe(m.nom)} ${safe(m.prenom)}<br />
        <strong>Naissance :</strong> ${safe(m.dateNaissance)} à ${safe(m.lieuNaissance)}<br />
        <strong>Nationalité :</strong> ${safe(m.nationalite)}<br />
        <strong>Adresse :</strong> ${safe(m.adresse)}<br />
        <strong>Autorité :</strong> ${safe(m.autorite)}
      </div>
    </div>`
  }

  // Majeur protégé
  if (data?.type === "majeur_protege" && data?.majeurProtege) {
    const mp = data.majeurProtege
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Majeur protégé</h2>
      <div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">
        <strong>Nom :</strong> ${safe(mp.nom)} ${safe(mp.prenom)}<br />
        <strong>Naissance :</strong> ${safe(mp.dateNaissance)} à ${safe(mp.lieuNaissance)}<br />
        <strong>Mesure :</strong> ${safe(mp.mesure)} (${safe(mp.mesureDetails)})<br />
        <strong>Représentant :</strong> ${safe(mp.representantPrenom)} ${safe(mp.representantNom)} (${safe(mp.representantQualite)})<br />
        <strong>Téléphone :</strong> ${safe(mp.telephone)}<br />
        <strong>Email :</strong> ${safe(mp.email)}
      </div>
    </div>`
  }

  // Autre situation
  if (data?.type === "autre" && data?.autreSituation) {
    const a = data.autreSituation
    contentHTML += `<div style="margin-bottom:16px;">
      <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Autre situation</h2>
      <div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">
        <strong>Description :</strong> ${safe(a.description)}<br />
        <strong>Contact :</strong> ${safe(a.contactPrenom)} ${safe(a.contactNom)}<br />
        <strong>Téléphone :</strong> ${safe(a.telephone)}<br />
        <strong>Email :</strong> ${safe(a.email)}
      </div>
    </div>`
  }

  const f = data?.financement || {}
  const hasFinancement = ["montantPrets","apportPersonnel","dureeSouhaitee","tauxInteretMax","mensualiteMax","banque","ressourcesMensuelles","mensualitesEnCours"].some((key) =>
    hasValue(f?.[key as keyof typeof f])
  )

  if (hasFinancement) {
    const financingLines: string[] = []
    if (f.achatComptant) {
      financingLines.push(`<strong>Mode de financement :</strong> Achat comptant (aucun prêt sollicité)`)
    } else {
      if (hasValue(f.montantPrets)) financingLines.push(`<strong>Montant global des prêts :</strong> ${safe(f.montantPrets)} €`)
      if (hasValue(f.apportPersonnel)) financingLines.push(`<strong>Apport personnel :</strong> ${safe(f.apportPersonnel)} €`)
      if (hasValue(f.dureeSouhaitee)) financingLines.push(`<strong>Durée du prêt souhaitée :</strong> ${safe(f.dureeSouhaitee)}`)
      if (hasValue(f.tauxInteretMax)) financingLines.push(`<strong>Taux d’intérêt maximum accepté :</strong> ${safe(f.tauxInteretMax)} %`)
      if (hasValue(f.mensualiteMax)) financingLines.push(`<strong>Mensualité maximale souhaitée :</strong> ${safe(f.mensualiteMax)} € / mois`)
    }
    if (hasValue(f.banque)) financingLines.push(`<strong>Banque :</strong> ${safe(f.banque)}`)
    if (hasValue(f.ressourcesMensuelles)) financingLines.push(`<strong>Ressources mensuelles :</strong> ${safe(f.ressourcesMensuelles)} € / mois`)
    if (hasValue(f.mensualitesEnCours)) financingLines.push(`<strong>Mensualités de crédits en cours :</strong> ${safe(f.mensualitesEnCours)} € / mois`)

    if (financingLines.length) {
      contentHTML += `<div style="margin-bottom:16px;">
        <h2 style="color:#0072BC;font-size:16px;margin:0 0 8px;">Financement de l'acquisition</h2>
        <div style="margin-bottom:12px;padding:8px;background:#f8fafc;border-radius:4px;">
          ${financingLines.join("<br />")}
        </div>
      </div>`
    }
  }
  
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
    <h1 style="color:#0072BC;font-size:20px;margin:0 0 12px;">${title}</h1>
    ${contentHTML}
    <div style="background:#ecfdf3;border:1px solid #bbf7d0;border-radius:6px;padding:10px 12px;margin-top:16px;">
      <p style="margin:0;color:#166534;font-weight:600;">📄 PDF de la fiche acquéreur joint</p>
    </div>
  </div>
</body>
</html>
  `
}

function formatPersonInfoText(p: any, index?: number): string {
  if (!p) return ""
  const parts: string[] = []
  if (p.civilite) parts.push(p.civilite)
  if (p.prenom) parts.push(p.prenom)
  if (p.nom) parts.push(p.nom)
  const name = parts.join(" ").trim()
  
  const info: string[] = []
  if (name) info.push(`${index ? `Acquéreur ${index}` : "Acquéreur"} : ${name}`)
  if (p.email) info.push(`Email : ${p.email}`)
  if (p.telephone) info.push(`Téléphone : ${p.telephone}`)
  if (p.adresse) info.push(`Adresse : ${p.adresse}`)
  if (p.dateNaissance) info.push(`Date de naissance : ${p.dateNaissance}`)
  if (p.lieuNaissance) info.push(`Lieu de naissance : ${p.lieuNaissance}`)
  if (p.nationalite) info.push(`Nationalité : ${p.nationalite}`)
  if (p.situationMatrimoniale) info.push(`Situation matrimoniale : ${p.situationMatrimoniale}`)
  if (p.notaireDesigne === "oui") {
    const notaire = [p.notaireNom, p.notaireVille].filter(Boolean).join(" à ")
    if (notaire) info.push(`Notaire désigné : ${notaire}`)
  }
  
  return info.length > 0 ? info.join("\n") : ""
}

function buildEmailText(data: any) {
  const hasValue = (v?: string | number | null) => Boolean(v !== undefined && v !== null && String(v).trim() !== "")
  const lines: string[] = [
    "⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.",
    "Pour toute question, contactez l'agence au 02 98 26 71 47 ou par mail à contact@alvimobilier.bzh.",
    "",
    "Nouveau formulaire acquéreur",
    `Type d'acquéreur : ${data?.type || "non précisé"}`,
    `Nombre d'acquéreurs déclarés : ${data?.nombreVendeurs || "-"}`,
    "",
    "Merci d’envoyer les copies de vos pièces d’identité directement à l’agence à l’adresse contact@alvimobilier.bzh.",
    "Ne répondez pas au mail automatique qui vous transmet cette fiche.",
    "",
  ]
  
  // Personne seule
  if (data?.type === "personne_seule" && data?.personne) {
    lines.push("Personne seule")
    lines.push(formatPersonInfoText(data.personne))
    lines.push("")
  }
  
  // Couple
  if (data?.type?.startsWith("couple")) {
    lines.push("Couple")
    if (data?.couple?.vendeur1) {
      lines.push(formatPersonInfoText(data.couple.vendeur1, 1))
      lines.push("")
    }
    if (data?.couple?.vendeur2) {
      lines.push(formatPersonInfoText(data.couple.vendeur2, 2))
      lines.push("")
    }
  }
  
  // Indivision
  if (data?.type === "indivision" && Array.isArray(data?.indivision)) {
    lines.push(`Indivision (${data.indivision.length} acquéreur(s))`)
    data.indivision.forEach((p: any, i: number) => {
      const info = formatPersonInfoText(p, i + 1)
      if (info) {
        lines.push(info)
        lines.push("")
      }
    })
  }

  if (data?.type === "societe" && data?.societe) {
    const s = data.societe
    lines.push("Société")
    lines.push(
      [
        `Dénomination : ${safe(s.denomination)}`,
        `Forme : ${safe(s.forme)}`,
        `Capital : ${safe(s.capital)}`,
        `Siège : ${safe(s.siege)}`,
        `RCS : ${safe(s.villeRcs)} / ${safe(s.numeroRcs)}`,
        `Téléphone : ${safe(s.telephone)}`,
        `Email : ${safe(s.email)}`,
      ].join("\n")
    )
    lines.push("")
  }

  if (data?.type === "entreprise_individuelle" && data?.ei) {
    const ei = data.ei
    lines.push("Entreprise individuelle")
    lines.push(
      [
        `Nom : ${safe(ei.nom)} ${safe(ei.prenom)}`,
        `Adresse : ${safe(ei.adresse)}`,
        `Registre : ${safe(ei.registre)} ${safe(ei.registrePrecision)}`,
        `Numéro : ${safe(ei.numero)}`,
        `Code APE : ${safe(ei.codeApe)}`,
      ].join("\n")
    )
    lines.push("")
  }

  if (data?.type === "association" && data?.association) {
    const a = data.association
    lines.push("Association")
    lines.push(
      [
        `Dénomination : ${safe(a.denomination)}`,
        `Siège : ${safe(a.siege)}`,
        `RNA : ${safe(a.numeroRna)} - SIREN : ${safe(a.numeroSiren)}`,
        `Téléphone : ${safe(a.telephone)}`,
        `Email : ${safe(a.email)}`,
      ].join("\n")
    )
    lines.push("")
  }

  if (data?.type === "personne_morale_autre" && data?.personneMorale) {
    const pm = data.personneMorale
    lines.push("Autre personne morale")
    lines.push(
      [
        `Description : ${safe(pm.description)}`,
        `Téléphone : ${safe(pm.telephone)}`,
        `Email : ${safe(pm.email)}`,
      ].join("\n")
    )
    lines.push("")
  }

  if (data?.type === "mineur" && data?.mineur) {
    const m = data.mineur
    lines.push("Mineur")
    lines.push(
      [
        `Nom : ${safe(m.nom)} ${safe(m.prenom)}`,
        `Naissance : ${safe(m.dateNaissance)} à ${safe(m.lieuNaissance)}`,
        `Nationalité : ${safe(m.nationalite)}`,
        `Adresse : ${safe(m.adresse)}`,
        `Autorité : ${safe(m.autorite)}`,
      ].join("\n")
    )
    lines.push("")
  }

  if (data?.type === "majeur_protege" && data?.majeurProtege) {
    const mp = data.majeurProtege
    lines.push("Majeur protégé")
    lines.push(
      [
        `Nom : ${safe(mp.nom)} ${safe(mp.prenom)}`,
        `Naissance : ${safe(mp.dateNaissance)} à ${safe(mp.lieuNaissance)}`,
        `Mesure : ${safe(mp.mesure)} (${safe(mp.mesureDetails)})`,
        `Représentant : ${safe(mp.representantPrenom)} ${safe(mp.representantNom)} (${safe(mp.representantQualite)})`,
        `Téléphone : ${safe(mp.telephone)}`,
        `Email : ${safe(mp.email)}`,
      ].join("\n")
    )
    lines.push("")
  }

  if (data?.type === "autre" && data?.autreSituation) {
    const a = data.autreSituation
    lines.push("Autre situation")
    lines.push(
      [
        `Description : ${safe(a.description)}`,
        `Contact : ${safe(a.contactPrenom)} ${safe(a.contactNom)}`,
        `Téléphone : ${safe(a.telephone)}`,
        `Email : ${safe(a.email)}`,
      ].join("\n")
    )
    lines.push("")
  }
  
  const f = data?.financement || {}
  const hasFinancement = ["montantPrets","apportPersonnel","dureeSouhaitee","tauxInteretMax","mensualiteMax","banque","ressourcesMensuelles","mensualitesEnCours"].some((key) =>
    hasValue(f?.[key as keyof typeof f])
  )

  if (hasFinancement) {
    lines.push("Financement de l'acquisition")
    if (f.achatComptant) {
      lines.push("Mode de financement : Achat comptant (aucun prêt sollicité)")
    } else {
      if (hasValue(f.montantPrets)) lines.push(`Montant global des prêts : ${safe(f.montantPrets)} €`)
      if (hasValue(f.apportPersonnel)) lines.push(`Apport personnel : ${safe(f.apportPersonnel)} €`)
      if (hasValue(f.dureeSouhaitee)) lines.push(`Durée du prêt souhaitée : ${safe(f.dureeSouhaitee)}`)
      if (hasValue(f.tauxInteretMax)) lines.push(`Taux d’intérêt maximum accepté : ${safe(f.tauxInteretMax)} %`)
      if (hasValue(f.mensualiteMax)) lines.push(`Mensualité maximale souhaitée : ${safe(f.mensualiteMax)} € / mois`)
    }
    if (hasValue(f.banque)) lines.push(`Banque : ${safe(f.banque)}`)
    if (hasValue(f.ressourcesMensuelles)) lines.push(`Ressources mensuelles : ${safe(f.ressourcesMensuelles)} € / mois`)
    if (hasValue(f.mensualitesEnCours)) lines.push(`Mensualités de crédits en cours : ${safe(f.mensualitesEnCours)} € / mois`)
    lines.push("")
  }
 
  lines.push("PDF en pièce jointe.")
  lines.push("Message automatique ALV Immobilier")
  
  return lines.filter(Boolean).join("\n")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info("Génération PDF Acquéreur demandée", { type: body?.type, nombreVendeurs: body?.nombreVendeurs })

    const pdfBuffer = await generateAcquereurPdf(body)
    const filename = buildAcquereurPdfFilename(body)

    // Générer les CSV pour chaque personne physique
    const persons = extractAcquereurPersons(body)
    const csvAttachments: Array<{ filename: string; content: Buffer; contentType: string }> = []

    for (let i = 0; i < persons.length; i++) {
      try {
        const csvBuffer = generateAcquereurCsvBuffer(persons[i])
        const csvFilename = buildAcquereurCsvFilename(persons[i], i)
        csvAttachments.push({
          filename: csvFilename,
          content: csvBuffer,
          contentType: "text/csv",
        })
        logger.info("CSV acquéreur généré", { filename: csvFilename, index: i })
      } catch (e: any) {
        logger.error("Erreur génération CSV acquéreur", { error: e, index: i })
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
        subject: buildAcquereurSubject(body),
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

    logger.info("Email envoyé avec PDF acquéreur et CSV", {
      filename,
      csvCount: csvAttachments.length,
      cc: ccList,
    })

    return NextResponse.json({
      success: true,
      message: "Formulaire acquéreur envoyé avec succès",
      filename,
      csvGenerated: csvAttachments.length > 0,
      csvCount: csvAttachments.length,
      emailSent: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Erreur lors de la génération PDF Acquéreur", { error })
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'envoi du formulaire acquéreur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API génération PDF Acquéreur - Utilisez POST avec les données du formulaire acquéreur",
  })
}
