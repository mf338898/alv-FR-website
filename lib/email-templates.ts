// Templates d'email enrichis avec plus d'informations

function formatGarantRevenus(garant: any): string {
  const parts: string[] = []
  if (garant.salaireNet?.trim()) parts.push(`Salaire net : ${garant.salaireNet} €`)
  if (garant.indemnitesChomage?.trim()) parts.push(`Indemnités chômage : ${garant.indemnitesChomage} €`)
  if (garant.pensionRetraite?.trim() || garant.pension?.trim()) parts.push(`Pension de retraite : ${(garant.pensionRetraite || garant.pension)} €`)
  if (garant.pensionReversion?.trim()) parts.push(`Pension de réversion : ${garant.pensionReversion} €`)
  if (garant.pensionAlimentaire?.trim()) parts.push(`Pension alimentaire : ${garant.pensionAlimentaire} €`)
  if (garant.aahAllocationsHandicap?.trim()) parts.push(`AAH / allocations handicap : ${garant.aahAllocationsHandicap} €`)
  if (garant.rsa?.trim()) parts.push(`RSA : ${garant.rsa} €`)
  if (garant.revenusAutoEntrepreneur?.trim()) parts.push(`Revenus indépendant / auto-entrepreneur complémentaires : ${garant.revenusAutoEntrepreneur} €`)
  if (garant.autreRevenu?.trim()) parts.push(`Autre revenu : ${garant.autreRevenu} €`)
  if (garant.aidesAuLogement?.trim()) parts.push(`Aides au logement : ${garant.aidesAuLogement} €`)
  return parts.length ? parts.join(", ") : "-"
}

function formatGarantRevenusHtml(garant: any): string {
  const pensionRetraite = hasValue(garant.pensionRetraite) ? garant.pensionRetraite : garant.pension
  return `
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 4px 0; font-weight: bold; color: #0072BC;">Revenus mensuels</p>
      <p style="margin: 0;"><strong>Revenu principal mensuel :</strong> ${displayAmount(garant.salaireNet)}</p>
      <p style="margin: 0;"><strong>Indemnités chômage :</strong> ${displayAmount(garant.indemnitesChomage)}</p>
      <p style="margin: 0;"><strong>Pension de retraite :</strong> ${displayAmount(pensionRetraite)}</p>
      <p style="margin: 0;"><strong>Pension de réversion :</strong> ${displayAmount(garant.pensionReversion)}</p>
      <p style="margin: 0;"><strong>Pension alimentaire :</strong> ${displayAmount(garant.pensionAlimentaire)}</p>
      <p style="margin: 0;"><strong>AAH / allocations handicap :</strong> ${displayAmount(garant.aahAllocationsHandicap)}</p>
      <p style="margin: 0;"><strong>RSA :</strong> ${displayAmount(garant.rsa)}</p>
      <p style="margin: 0;"><strong>Aides au logement (APL estimées si connues) :</strong> ${displayAmount(garant.aidesAuLogement)}</p>
      <p style="margin: 0;"><strong>Revenus indépendant / auto-entrepreneur complémentaires :</strong> ${displayAmount(garant.revenusAutoEntrepreneur)}</p>
      <p style="margin: 0;"><strong>Autre revenu :</strong> ${displayAmount(garant.autreRevenu)}</p>
    </div>
  `.trim()
}

function formatGarantRevenusText(garant: any): string {
  const pensionRetraite = hasValue(garant.pensionRetraite) ? garant.pensionRetraite : garant.pension
  return [
    `  - Revenu principal mensuel : ${displayAmount(garant.salaireNet)}`,
    `  - Indemnités chômage : ${displayAmount(garant.indemnitesChomage)}`,
    `  - Pension de retraite : ${displayAmount(pensionRetraite)}`,
    `  - Pension de réversion : ${displayAmount(garant.pensionReversion)}`,
    `  - Pension alimentaire : ${displayAmount(garant.pensionAlimentaire)}`,
    `  - AAH / allocations handicap : ${displayAmount(garant.aahAllocationsHandicap)}`,
    `  - RSA : ${displayAmount(garant.rsa)}`,
    `  - Aides au logement (APL estimées si connues) : ${displayAmount(garant.aidesAuLogement)}`,
    `  - Revenus indépendant / auto-entrepreneur complémentaires : ${displayAmount(garant.revenusAutoEntrepreneur)}`,
    `  - Autre revenu : ${displayAmount(garant.autreRevenu)}`
  ].join("\n")
}

const SITUATIONS_AVEC_EMPLOYEUR = new Set([
  "CDI",
  "CDD",
  "Fonctionnaire",
  "Alternance",
  "Stage",
  "Contrat aidé / insertion",
])

const SITUATIONS_INDEPENDANTES = new Set([
  "Indépendant / freelance / auto-entrepreneur",
  "Intermittent du spectacle",
])

const SITUATIONS_SANS_ACTIVITE = new Set([
  "Sans activité professionnelle",
  "Parent au foyer",
])

function hasValue(value: any): boolean {
  return typeof value === "string" ? value.trim() !== "" : value !== null && value !== undefined
}

function displayValue(value: any): string {
  return hasValue(value) ? String(value) : "-"
}

function displayAmount(value: any): string {
  return hasValue(value) ? `${value} €` : "-"
}

function displayDate(value: any): string {
  if (!hasValue(value)) return "-"
  const s = String(value).trim()
  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (dmy) return `${dmy[1].padStart(2, "0")}/${dmy[2].padStart(2, "0")}/${dmy[3]}`
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  return s
}

function isSituationSalariee(situationPro: string): boolean {
  return SITUATIONS_AVEC_EMPLOYEUR.has(situationPro || "")
}

function isSituationIndependante(situationPro: string): boolean {
  return SITUATIONS_INDEPENDANTES.has(situationPro || "")
}

function showProfessionField(situationPro: string): boolean {
  return !SITUATIONS_SANS_ACTIVITE.has(situationPro || "")
}

function formatLocataireRevenusHtml(locataire: any): string {
  const pensionRetraite = hasValue(locataire.pensionRetraite) ? locataire.pensionRetraite : locataire.pension
  const autresRevenus: string[] = []
  if (hasValue(locataire.indemnitesChomage)) autresRevenus.push(`<p style="margin: 0;"><strong>Indemnités chômage :</strong> ${displayAmount(locataire.indemnitesChomage)}</p>`)
  if (hasValue(pensionRetraite)) autresRevenus.push(`<p style="margin: 0;"><strong>Pension de retraite :</strong> ${displayAmount(pensionRetraite)}</p>`)
  if (hasValue(locataire.pensionReversion)) autresRevenus.push(`<p style="margin: 0;"><strong>Pension de réversion :</strong> ${displayAmount(locataire.pensionReversion)}</p>`)
  if (hasValue(locataire.pensionAlimentaire)) autresRevenus.push(`<p style="margin: 0;"><strong>Pension alimentaire :</strong> ${displayAmount(locataire.pensionAlimentaire)}</p>`)
  if (hasValue(locataire.aahAllocationsHandicap)) autresRevenus.push(`<p style="margin: 0;"><strong>AAH / allocations handicap :</strong> ${displayAmount(locataire.aahAllocationsHandicap)}</p>`)
  if (hasValue(locataire.rsa)) autresRevenus.push(`<p style="margin: 0;"><strong>RSA :</strong> ${displayAmount(locataire.rsa)}</p>`)
  if (hasValue(locataire.aidesAuLogement)) autresRevenus.push(`<p style="margin: 0;"><strong>Aides au logement (APL estimées si connues) :</strong> ${displayAmount(locataire.aidesAuLogement)}</p>`)
  if (hasValue(locataire.revenusAutoEntrepreneur)) autresRevenus.push(`<p style="margin: 0;"><strong>Revenus indépendant / auto-entrepreneur complémentaires :</strong> ${displayAmount(locataire.revenusAutoEntrepreneur)}</p>`)
  if (hasValue(locataire.autreRevenu)) autresRevenus.push(`<p style="margin: 0;"><strong>Autre revenu :</strong> ${displayAmount(locataire.autreRevenu)}</p>`)

  return `
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 4px 0; font-weight: bold; color: #0072BC;">Revenus mensuels</p>
      <p style="margin: 0;"><strong>Revenu principal mensuel :</strong> ${displayAmount(locataire.salaireNet)}</p>
      ${autresRevenus.join("\n")}
    </div>
  `.trim()
}

function formatLocataireRevenusText(locataire: any): string {
  const pensionRetraite = hasValue(locataire.pensionRetraite) ? locataire.pensionRetraite : locataire.pension
  const lines = [`  - Revenu principal mensuel : ${displayAmount(locataire.salaireNet)}`]
  if (hasValue(locataire.indemnitesChomage)) lines.push(`  - Indemnités chômage : ${displayAmount(locataire.indemnitesChomage)}`)
  if (hasValue(pensionRetraite)) lines.push(`  - Pension de retraite : ${displayAmount(pensionRetraite)}`)
  if (hasValue(locataire.pensionReversion)) lines.push(`  - Pension de réversion : ${displayAmount(locataire.pensionReversion)}`)
  if (hasValue(locataire.pensionAlimentaire)) lines.push(`  - Pension alimentaire : ${displayAmount(locataire.pensionAlimentaire)}`)
  if (hasValue(locataire.aahAllocationsHandicap)) lines.push(`  - AAH / allocations handicap : ${displayAmount(locataire.aahAllocationsHandicap)}`)
  if (hasValue(locataire.rsa)) lines.push(`  - RSA : ${displayAmount(locataire.rsa)}`)
  if (hasValue(locataire.aidesAuLogement)) lines.push(`  - Aides au logement (APL estimées si connues) : ${displayAmount(locataire.aidesAuLogement)}`)
  if (hasValue(locataire.revenusAutoEntrepreneur)) lines.push(`  - Revenus indépendant / auto-entrepreneur complémentaires : ${displayAmount(locataire.revenusAutoEntrepreneur)}`)
  if (hasValue(locataire.autreRevenu)) lines.push(`  - Autre revenu : ${displayAmount(locataire.autreRevenu)}`)
  return lines.join("\n")
}

export function generateGarantEmailHTML(data: {
  garants: any[]
  cautionnes: any[]
  timestamp: string
}): string {
  const { garants, cautionnes } = data
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 16px; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 16px; border-radius: 8px;">
        <div style="background-color:#fff5f5;border:1px solid #fecdd3;color:#b91c1c;padding:10px 12px;border-radius:6px;margin-bottom:16px;font-weight:600;font-size:13px;">
          ⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.<br />
          Pour toute question, contactez l’agence au 02 98 26 71 47 ou par mail à contact@alvimmobilier.bzh.
        </div>
        
        <h1 style="color: #0072BC; margin: 0 0 14px 0;">Nouveau formulaire de garant reçu</h1>
        
        <!-- Résumé général -->
        <div style="background-color: #f0f9ff; border-left: 4px solid #0072BC; padding: 12px; margin-bottom: 14px;">
            <h2 style="color: #0072BC; margin: 0 0 8px 0; font-size: 16px;">📊 Résumé général</h2>
            <p style="margin: 0;"><strong>Nombre de cautionnaires :</strong> ${garants.length}</p>
            <p style="margin: 0;"><strong>Nombre de locataires concernés :</strong> ${garants.filter(g => hasValue(g.locataireConcerneNom) || hasValue(g.locataireConcernePrenom)).length}</p>
            <p style="margin: 0;"><strong>Locataire(s) concerné(s) :</strong> ${garants
              .map(g => `${g.locataireConcernePrenom || ''} ${g.locataireConcerneNom || ''}`.trim())
              .filter(Boolean)
              .join(', ') || '-'}</p>
            <p style="margin: 0;"><strong>Date de soumission :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>

        <!-- Garants -->
        <div style="margin-bottom: 14px;">
            <h2 style="color: #0072BC; margin: 0 0 10px 0; font-size: 16px;">👥 Cautionnaire(s)</h2>
            ${garants.map((garant, index) => `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; margin-bottom: 8px; border-radius: 6px;">
                    <h3 style="color: #0072BC; margin: 0 0 8px 0; font-size: 14px;">Cautionnaire ${index + 1}</h3>
                    <p style="margin: 0;"><strong>Nom :</strong> ${displayValue(`${garant.prenom || ""} ${garant.nom || ""}`.trim())}</p>
                    <p style="margin: 0;"><strong>Civilité :</strong> ${displayValue(garant.civilite)}</p>
                    <p style="margin: 0;"><strong>Situation familiale :</strong> ${displayValue(garant.situationConjugale)}</p>
                    <p style="margin: 0;"><strong>Date de naissance :</strong> ${displayDate(garant.dateNaissance)}</p>
                    <p style="margin: 0;"><strong>Lieu de naissance :</strong> ${displayValue(garant.lieuNaissance)}</p>
                    <p style="margin: 0;"><strong>Adresse :</strong> ${displayValue(garant.adresseActuelle)}</p>
                    <p style="margin: 0;"><strong>Téléphone :</strong> ${displayValue(garant.telephone)}</p>
                    <p style="margin: 0;"><strong>Email :</strong> ${displayValue(garant.email)}</p>
                    <p style="margin: 0;"><strong>Situation professionnelle :</strong> ${displayValue(garant.typeContrat)}</p>
                    ${showProfessionField(garant.typeContrat) ? `<p style="margin: 0;"><strong>Profession / activité :</strong> ${displayValue(garant.profession)}</p>` : ""}
                    ${isSituationSalariee(garant.typeContrat) ? `
                      <p style="margin: 0;"><strong>Nom de l'employeur :</strong> ${displayValue(garant.employeurNom)}</p>
                      <p style="margin: 0;"><strong>Adresse employeur :</strong> ${displayValue(garant.employeurAdresse)}</p>
                      <p style="margin: 0;"><strong>Téléphone employeur :</strong> ${displayValue(garant.employeurTelephone)}</p>
                      <p style="margin: 0;"><strong>Date d'embauche :</strong> ${displayDate(garant.dateEmbauche)}</p>
                    ` : ""}
                    ${isSituationIndependante(garant.typeContrat) ? `
                      <p style="margin: 0;"><strong>Entreprise / activité :</strong> ${displayValue(garant.employeurNom)}</p>
                      <p style="margin: 0;"><strong>Adresse activité :</strong> ${displayValue(garant.employeurAdresse)}</p>
                      <p style="margin: 0;"><strong>Téléphone activité :</strong> ${displayValue(garant.employeurTelephone)}</p>
                      <p style="margin: 0;"><strong>Date de début d'activité :</strong> ${displayDate(garant.dateDebutActivite)}</p>
                    ` : ""}
                    ${formatGarantRevenusHtml(garant)}
                    <p style="margin: 0;"><strong>Informations complémentaires :</strong> ${displayValue(garant.informationsComplementaires)}</p>
                </div>
            `).join('')}
        </div>

        <!-- Locataire concerné -->
        <div style="margin-bottom: 14px;">
            <h2 style="color: #0072BC; margin: 0 0 10px 0; font-size: 16px;">🏠 Lien avec le locataire / dossier concerné</h2>
            ${garants.map((garant, index) => `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
                <h3 style="color: #f59e0b; margin: 0 0 8px 0; font-size: 14px;">Locataire concerné - cautionnaire ${index + 1}</h3>
                <p style="margin: 0;"><strong>Nom :</strong> ${displayValue(`${garant.locataireConcernePrenom || ''} ${garant.locataireConcerneNom || ''}`.trim())}</p>
                <p style="margin: 0;"><strong>Email :</strong> ${displayValue(garant.locataireConcerneEmail)}</p>
                <p style="margin: 0;"><strong>Téléphone :</strong> ${displayValue(garant.locataireConcerneTelephone)}</p>
              </div>
            `).join('')}
        </div>

        <!-- PDF Notice -->
        <div style="background-color: #dcfce7; border: 1px solid #bbf7d0; padding: 12px; text-align: center; margin-top: 14px; border-radius: 6px;">
            <p style="margin: 0; color: #166534; font-weight: bold;">📄 PDF complet joint</p>
            <p style="margin: 4px 0 0 0; color: #166534;">📑 CSV import CRM (ImmoFacile / AC3) joint</p>
        </div>

        
    </div>
</body>
</html>
  `.trim()
}

export function generateGarantEmailText(data: {
  garants: any[]
  cautionnes: any[]
  timestamp: string
}): string {
  const { garants, cautionnes } = data
  
  return `
⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.
Pour toute question, contactez l’agence au 02 98 26 71 47 ou par mail à contact@alvimmobilier.bzh.

NOUVEAU FORMULAIRE DE GARANT REÇU - ALV IMMOBILIER

RÉSUMÉ GÉNÉRAL :
- Nombre de cautionnaires : ${garants.length}
- Nombre de locataires concernés : ${garants.filter(g => hasValue(g.locataireConcerneNom) || hasValue(g.locataireConcernePrenom)).length}
- Locataire(s) concerné(s) : ${garants
  .map(g => `${g.locataireConcernePrenom || ''} ${g.locataireConcerneNom || ''}`.trim())
  .filter(Boolean)
  .join(', ') || '-'}
- Date de soumission : ${new Date().toLocaleString('fr-FR')}

Cautionnaire(s) :
${garants.map((garant, index) => `
Cautionnaire ${index + 1} :
- Nom : ${displayValue(`${garant.prenom || ""} ${garant.nom || ""}`.trim())}
- Civilité : ${displayValue(garant.civilite)}
- Situation familiale : ${displayValue(garant.situationConjugale)}
- Date de naissance : ${displayDate(garant.dateNaissance)}
- Lieu de naissance : ${displayValue(garant.lieuNaissance)}
- Adresse : ${displayValue(garant.adresseActuelle)}
- Téléphone : ${displayValue(garant.telephone)}
- Email : ${displayValue(garant.email)}
- Situation professionnelle : ${displayValue(garant.typeContrat)}
${showProfessionField(garant.typeContrat) ? `- Profession / activité : ${displayValue(garant.profession)}` : ""}
${isSituationSalariee(garant.typeContrat) ? `- Nom de l'employeur : ${displayValue(garant.employeurNom)}
- Adresse employeur : ${displayValue(garant.employeurAdresse)}
- Téléphone employeur : ${displayValue(garant.employeurTelephone)}
- Date d'embauche : ${displayDate(garant.dateEmbauche)}` : ""}
${isSituationIndependante(garant.typeContrat) ? `- Entreprise / activité : ${displayValue(garant.employeurNom)}
- Adresse activité : ${displayValue(garant.employeurAdresse)}
- Téléphone activité : ${displayValue(garant.employeurTelephone)}
- Date de début d'activité : ${displayDate(garant.dateDebutActivite)}` : ""}
- Revenus mensuels :
${formatGarantRevenusText(garant)}
- Informations complémentaires : ${displayValue(garant.informationsComplementaires)}
`).join('\n')}

LIEN AVEC LE LOCATAIRE / DOSSIER CONCERNÉ :
${garants.map((garant, index) => `
Locataire concerné - cautionnaire ${index + 1} :
- Nom : ${displayValue(`${garant.locataireConcernePrenom || ''} ${garant.locataireConcerneNom || ''}`.trim())}
- Email : ${displayValue(garant.locataireConcerneEmail)}
- Téléphone : ${displayValue(garant.locataireConcerneTelephone)}
`).join('\n')}

PDF COMPLET JOINT
  `.trim()
}

export function generateLocataireEmailHTML(data: {
  formData: any
  timestamp: string
}): string {
  const { formData } = data
  const { locataires, criteresRecherche, garanties, bienConcerne, nombreEnfantsFoyer, veutRemplirRecherche } = formData
  const rechercheType = criteresRecherche?.rechercheType || ""
  const montreBlocAchat = rechercheType === "achat" || rechercheType === "les_deux"
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 16px; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 16px; border-radius: 8px;">
        <div style="background-color:#fff5f5;border:1px solid #fecdd3;color:#b91c1c;padding:10px 12px;border-radius:6px;margin-bottom:16px;font-weight:600;font-size:13px;">
          ⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.<br />
          Pour toute question, contactez l’agence au 02 98 26 71 47 ou par mail à contact@alvimmobilier.bzh.
        </div>
        
        <h1 style="color: #0072BC; margin: 0 0 14px 0;">Nouveau formulaire locataire reçu</h1>
        
        <!-- Résumé général -->
        <div style="background-color: #f0f9ff; border-left: 4px solid #0072BC; padding: 12px; margin-bottom: 14px;">
            <h2 style="color: #0072BC; margin: 0 0 8px 0; font-size: 16px;">📊 Résumé général</h2>
            <p style="margin: 0;"><strong>Bien concerné :</strong> ${displayValue(bienConcerne)}</p>
            <p style="margin: 0;"><strong>Nombre de locataires :</strong> ${locataires.length}</p>
            <p style="margin: 0;"><strong>Enfants dans le foyer :</strong> ${nombreEnfantsFoyer || 0}</p>
            <p style="margin: 0;"><strong>Critères de recherche complétés :</strong> ${veutRemplirRecherche === "oui" ? "Oui" : "Non pour le moment"}</p>
            <p style="margin: 0;"><strong>Date de soumission :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>

        <!-- Locataires -->
        <div style="margin-bottom: 14px;">
            <h2 style="color: #0072BC; margin: 0 0 10px 0; font-size: 16px;">👥 Locataire(s)</h2>
            ${locataires.map((locataire: any, index: number) => `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; margin-bottom: 8px; border-radius: 6px;">
                    <h3 style="color: #0072BC; margin: 0 0 8px 0; font-size: 14px;">Locataire ${index + 1}</h3>
                    <p style="margin: 0;"><strong>Nom :</strong> ${displayValue(`${locataire.prenom || ""} ${locataire.nom || ""}`.trim())}</p>
                    <p style="margin: 0;"><strong>Civilité :</strong> ${displayValue(locataire.civilite)}</p>
                    <p style="margin: 0;"><strong>Situation conjugale :</strong> ${displayValue(locataire.situationConjugale)}</p>
                    <p style="margin: 0;"><strong>Date de naissance :</strong> ${displayDate(locataire.dateNaissance)}</p>
                    <p style="margin: 0;"><strong>Lieu de naissance :</strong> ${displayValue(locataire.lieuNaissance)}</p>
                    <p style="margin: 0;"><strong>Adresse actuelle :</strong> ${displayValue(locataire.adresseActuelle)}</p>
                    <p style="margin: 0;"><strong>Téléphone :</strong> ${displayValue(locataire.telephone)}</p>
                    <p style="margin: 0;"><strong>Email :</strong> ${displayValue(locataire.email)}</p>
                    <p style="margin: 0;"><strong>Situation professionnelle :</strong> ${displayValue(locataire.typeContrat)}</p>
                    ${showProfessionField(locataire.typeContrat) ? `<p style="margin: 0;"><strong>Profession / activité :</strong> ${displayValue(locataire.profession)}</p>` : ""}
                    ${isSituationSalariee(locataire.typeContrat) ? `
                      <p style="margin: 0;"><strong>Employeur :</strong> ${displayValue(locataire.employeurNom)}</p>
                      <p style="margin: 0;"><strong>Adresse employeur :</strong> ${displayValue(locataire.employeurAdresse)}</p>
                      <p style="margin: 0;"><strong>Téléphone employeur :</strong> ${displayValue(locataire.employeurTelephone)}</p>
                      <p style="margin: 0;"><strong>Date d'embauche :</strong> ${displayDate(locataire.dateEmbauche)}</p>
                    ` : ""}
                    ${isSituationIndependante(locataire.typeContrat) ? `
                      <p style="margin: 0;"><strong>Entreprise / activité :</strong> ${displayValue(locataire.employeurNom)}</p>
                      <p style="margin: 0;"><strong>Adresse activité :</strong> ${displayValue(locataire.employeurAdresse)}</p>
                      <p style="margin: 0;"><strong>Téléphone activité :</strong> ${displayValue(locataire.employeurTelephone)}</p>
                      <p style="margin: 0;"><strong>Date de début d'activité :</strong> ${displayDate(locataire.dateDebutActivite)}</p>
                    ` : ""}
                    ${formatLocataireRevenusHtml(locataire)}
                </div>
            `).join('')}
        </div>

        <!-- Critères de recherche -->
        <div style="margin-bottom: 14px;">
            <h2 style="color: #0072BC; margin: 0 0 10px 0; font-size: 16px;">🔍 Critères de recherche</h2>
            <div style="background-color: #f0f9ff; border-left: 4px solid #0072BC; padding: 12px; border-radius: 0 4px 4px 0;">
                <p style="margin: 0;"><strong>Vous recherchez :</strong> ${displayValue(
                  rechercheType === "location"
                    ? "Location"
                    : rechercheType === "achat"
                      ? "Achat"
                      : rechercheType === "les_deux"
                        ? "Les deux"
                        : ""
                )}</p>
                <p style="margin: 0;"><strong>Nombre de chambres souhaitées :</strong> ${displayValue(criteresRecherche.nombreChambres)}</p>
                <p style="margin: 0;"><strong>Secteur souhaité :</strong> ${displayValue(criteresRecherche.secteurSouhaite)}</p>
                <p style="margin: 0;"><strong>Rayon de recherche :</strong> ${hasValue(criteresRecherche.rayonKm) ? `${criteresRecherche.rayonKm} km` : "-"}</p>
                <p style="margin: 0;"><strong>Date d'emménagement souhaitée :</strong> ${displayDate(criteresRecherche.dateEmmenagement)}</p>
                <p style="margin: 0;"><strong>Préavis à déposer :</strong> ${displayValue(criteresRecherche.preavisADeposer)}</p>
                <p style="margin: 0;"><strong>Loyer maximum :</strong> ${displayAmount(criteresRecherche.loyerMax)}</p>
                <p style="margin: 0;"><strong>Raison du déménagement :</strong> ${displayValue(criteresRecherche.raisonDemenagement)}</p>
                ${montreBlocAchat ? `
                  <p style="margin: 0;"><strong>Type de bien recherché (achat) :</strong> ${displayValue(criteresRecherche.typeBienAchat)}</p>
                  <p style="margin: 0;"><strong>Budget max (achat) :</strong> ${displayAmount(criteresRecherche.budgetAchat)}</p>
                  <p style="margin: 0;"><strong>Financement / apport (achat) :</strong> ${displayValue(criteresRecherche.financementAchat)}</p>
                  <p style="margin: 0;"><strong>Avez-vous vu votre banque ? :</strong> ${displayValue(criteresRecherche.banqueConsultee)}</p>
                ` : ""}
                <p style="margin: 0;"><strong>Informations complémentaires :</strong> ${displayValue(criteresRecherche.informationsComplementaires)}</p>
            </div>
        </div>

        <!-- Garanties -->
        <div style="margin-bottom: 14px;">
            <h2 style="color: #0072BC; margin: 0 0 10px 0; font-size: 16px;">🛡️ Garanties</h2>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 0 4px 4px 0;">
                <p style="margin: 0;"><strong>Garant familial :</strong> ${displayValue(garanties.garantFamilial)}</p>
                <p style="margin: 0;"><strong>Garantie Visale :</strong> ${displayValue(garanties.garantieVisale)}</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">En savoir plus sur la garantie Visale : <a href="https://www.visale.fr/" target="_blank" rel="noopener noreferrer" style="color: #6b7280; text-decoration: underline;">https://www.visale.fr/</a></p>
                <p style="margin: 0;"><strong>Précisions sur les garants :</strong> ${displayValue(garanties.precisionGarant)}</p>
            </div>
        </div>

        <!-- PDF Notice -->
        <div style="background-color: #dcfce7; border: 1px solid #bbf7d0; padding: 12px; text-align: center; margin-top: 14px; border-radius: 6px;">
            <p style="margin: 0; color: #166534; font-weight: bold;">📄 PDF complet joint</p>
        </div>

        
    </div>
</body>
</html>
  `.trim()
}

export function generateLocataireEmailText(data: {
  formData: any
  timestamp: string
}): string {
  const { formData } = data
  const { locataires, criteresRecherche, garanties, bienConcerne, nombreEnfantsFoyer, veutRemplirRecherche } = formData
  const rechercheType = criteresRecherche?.rechercheType || ""
  const montreBlocAchat = rechercheType === "achat" || rechercheType === "les_deux"
  
  return `
⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.
Pour toute question, contactez l’agence au 02 98 26 71 47 ou par mail à contact@alvimmobilier.bzh.

NOUVEAU FORMULAIRE LOCATAIRE REÇU - ALV IMMOBILIER

RÉSUMÉ GÉNÉRAL :
- Bien concerné : ${displayValue(bienConcerne)}
- Nombre de locataires : ${locataires.length}
- Enfants dans le foyer : ${nombreEnfantsFoyer || 0}
- Critères de recherche complétés : ${veutRemplirRecherche === "oui" ? "Oui" : "Non pour le moment"}
- Date de soumission : ${new Date().toLocaleString('fr-FR')}

LOCATAIRE(S) :
${locataires.map((locataire: any, index: number) => `
Locataire ${index + 1} :
- Nom : ${displayValue(`${locataire.prenom || ""} ${locataire.nom || ""}`.trim())}
- Civilité : ${displayValue(locataire.civilite)}
- Situation conjugale : ${displayValue(locataire.situationConjugale)}
- Date de naissance : ${displayDate(locataire.dateNaissance)}
- Lieu de naissance : ${displayValue(locataire.lieuNaissance)}
- Adresse actuelle : ${displayValue(locataire.adresseActuelle)}
- Téléphone : ${displayValue(locataire.telephone)}
- Email : ${displayValue(locataire.email)}
- Situation professionnelle : ${displayValue(locataire.typeContrat)}
${showProfessionField(locataire.typeContrat) ? `- Profession / activité : ${displayValue(locataire.profession)}` : ""}
${isSituationSalariee(locataire.typeContrat) ? `- Employeur : ${displayValue(locataire.employeurNom)}
- Adresse employeur : ${displayValue(locataire.employeurAdresse)}
- Téléphone employeur : ${displayValue(locataire.employeurTelephone)}
- Date d'embauche : ${displayDate(locataire.dateEmbauche)}` : ""}
${isSituationIndependante(locataire.typeContrat) ? `- Entreprise / activité : ${displayValue(locataire.employeurNom)}
- Adresse activité : ${displayValue(locataire.employeurAdresse)}
- Téléphone activité : ${displayValue(locataire.employeurTelephone)}
- Date de début d'activité : ${displayDate(locataire.dateDebutActivite)}` : ""}
- Revenus mensuels :
${formatLocataireRevenusText(locataire)}
`).join('\n')}

CRITÈRES DE RECHERCHE :
- Vous recherchez : ${displayValue(
  rechercheType === "location"
    ? "Location"
    : rechercheType === "achat"
      ? "Achat"
      : rechercheType === "les_deux"
        ? "Les deux"
        : ""
)}
- Nombre de chambres souhaitées : ${displayValue(criteresRecherche.nombreChambres)}
- Secteur souhaité : ${displayValue(criteresRecherche.secteurSouhaite)}
- Rayon de recherche : ${hasValue(criteresRecherche.rayonKm) ? `${criteresRecherche.rayonKm} km` : "-"}
- Date d'emménagement souhaitée : ${displayDate(criteresRecherche.dateEmmenagement)}
- Préavis à déposer : ${displayValue(criteresRecherche.preavisADeposer)}
- Loyer maximum : ${displayAmount(criteresRecherche.loyerMax)}
- Raison du déménagement : ${displayValue(criteresRecherche.raisonDemenagement)}
${montreBlocAchat ? `- Type de bien recherché (achat) : ${displayValue(criteresRecherche.typeBienAchat)}
- Budget max (achat) : ${displayAmount(criteresRecherche.budgetAchat)}
- Financement / apport (achat) : ${displayValue(criteresRecherche.financementAchat)}
- Avez-vous vu votre banque ? : ${displayValue(criteresRecherche.banqueConsultee)}` : ""}
- Informations complémentaires : ${displayValue(criteresRecherche.informationsComplementaires)}

GARANTIES :
- Garant familial : ${displayValue(garanties.garantFamilial)}
- Garantie Visale : ${displayValue(garanties.garantieVisale)}
- En savoir plus sur la garantie Visale : https://www.visale.fr/
- Précisions sur les garants : ${displayValue(garanties.precisionGarant)}

PDF + CSV (import CRM) JOINTS
  `.trim()
}
