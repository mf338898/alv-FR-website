// Templates d'email enrichis avec plus d'informations

function formatGarantRevenus(garant: any): string {
  const parts: string[] = []
  if (garant.salaireNet?.trim()) parts.push(`Salaire net : ${garant.salaireNet} €`)
  if (garant.indemnitesChomage?.trim()) parts.push(`Indemnités chômage : ${garant.indemnitesChomage} €`)
  if (garant.aahAllocationsHandicap?.trim()) parts.push(`AAH / Allocations handicap : ${garant.aahAllocationsHandicap} €`)
  if (garant.rsa?.trim()) parts.push(`RSA : ${garant.rsa} €`)
  if (garant.pension?.trim()) parts.push(`Pension : ${garant.pension} €`)
  if (garant.revenusAutoEntrepreneur?.trim()) parts.push(`Revenus auto-entrepreneur : ${garant.revenusAutoEntrepreneur} €`)
  if (garant.aidesAuLogement?.trim()) parts.push(`Aides au logement : ${garant.aidesAuLogement} €`)
  return parts.length ? parts.join(", ") : "-"
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
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
        <div style="background-color:#fff5f5;border:1px solid #fecdd3;color:#b91c1c;padding:10px 12px;border-radius:6px;margin-bottom:16px;font-weight:600;font-size:13px;">
          ⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.<br />
          Pour toute question, contactez l’agence au 02 98 26 71 47 ou par mail à contact@alvimmobilier.bzh.
        </div>
        <div style="background-color:#fff5f5;border:1px solid #fecdd3;color:#b91c1c;padding:10px 12px;border-radius:6px;margin-bottom:16px;font-weight:600;font-size:13px;">
          ⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.<br />
          Pour toute question, contactez l’agence au 02 98 26 71 47 ou par mail à contact@alvimmobilier.bzh.
        </div>
        
        <h1 style="color: #0072BC; margin: 0 0 20px 0;">Nouveau formulaire de garant reçu</h1>
        
        <!-- Résumé général -->
        <div style="background-color: #f0f9ff; border-left: 4px solid #0072BC; padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #0072BC; margin: 0 0 10px 0; font-size: 16px;">📊 Résumé général</h2>
            <p style="margin: 5px 0;"><strong>Nombre de garants :</strong> ${garants.length}</p>
            <p style="margin: 5px 0;"><strong>Nombre de locataires concernés :</strong> ${garants.filter(g => g.locataireConcerneNom || g.locataireConcernePrenom).length}</p>
            <p style="margin: 5px 0;"><strong>Locataire concerné :</strong> ${garants.filter(g => g.locataireConcerneNom || g.locataireConcernePrenom).map(g => `${g.locataireConcernePrenom || ''} ${g.locataireConcerneNom || ''}`).filter(Boolean).join(', ') || 'Non renseigné'}</p>
            <p style="margin: 5px 0;"><strong>Date de soumission :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>

        <!-- Garants -->
        <div style="margin-bottom: 20px;">
            <h2 style="color: #0072BC; margin: 0 0 15px 0; font-size: 16px;">👥 Garant(s)</h2>
            ${garants.map((garant, index) => `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 10px; border-radius: 6px;">
                    <h3 style="color: #0072BC; margin: 0 0 10px 0; font-size: 14px;">Garant ${index + 1}</h3>
                    <p style="margin: 3px 0;"><strong>Nom :</strong> ${garant.prenom} ${garant.nom}</p>
                    <p style="margin: 3px 0;"><strong>Civilité :</strong> ${garant.civilite || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Situation :</strong> ${garant.situationConjugale || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Adresse :</strong> ${garant.adresseActuelle || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Téléphone :</strong> ${garant.telephone || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Email :</strong> ${garant.email || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Profession :</strong> ${garant.profession || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Employeur :</strong> ${garant.employeurNom || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Revenus mensuels :</strong> ${formatGarantRevenus(garant)}</p>
                </div>
            `).join('')}
        </div>

        <!-- Locataire concerné -->
        <div style="margin-bottom: 20px;">
            <h2 style="color: #0072BC; margin: 0 0 15px 0; font-size: 16px;">🏠 Locataire concerné</h2>
            ${garants.map((garant, index) => {
              if (garant.locataireConcerneNom || garant.locataireConcernePrenom) {
                return `
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 10px; border-radius: 0 4px 4px 0;">
                    <h3 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 14px;">Locataire concerné par le garant ${index + 1}</h3>
                    <p style="margin: 3px 0;"><strong>Nom :</strong> ${garant.locataireConcernePrenom || ''} ${garant.locataireConcerneNom || ''}</p>
                    <p style="margin: 3px 0;"><strong>Email :</strong> ${garant.locataireConcerneEmail || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Téléphone :</strong> ${garant.locataireConcerneTelephone || '-'}</p>
                </div>
                `
              }
              return ''
            }).join('')}
        </div>

        <!-- PDF Notice -->
        <div style="background-color: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; text-align: center; margin-top: 20px; border-radius: 6px;">
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
- Nombre de garants : ${garants.length}
- Nombre de locataires concernés : ${garants.filter(g => g.locataireConcerneNom || g.locataireConcernePrenom).length}
- Locataire concerné : ${garants.filter(g => g.locataireConcerneNom || g.locataireConcernePrenom).map(g => `${g.locataireConcernePrenom || ''} ${g.locataireConcerneNom || ''}`).filter(Boolean).join(', ') || 'Non renseigné'}
- Date de soumission : ${new Date().toLocaleString('fr-FR')}

GARANT(S) :
${garants.map((garant, index) => `
Garant ${index + 1} :
- Nom : ${garant.prenom} ${garant.nom}
- Civilité : ${garant.civilite || '-'}
- Situation : ${garant.situationConjugale || '-'}
- Adresse : ${garant.adresseActuelle || '-'}
- Téléphone : ${garant.telephone || '-'}
- Email : ${garant.email || '-'}
- Profession : ${garant.profession || '-'}
- Employeur : ${garant.employeurNom || '-'}
- Revenus mensuels : ${formatGarantRevenus(garant)}
`).join('\n')}

LOCATAIRE(S) CONCERNÉ(S) :
${garants.map((garant, index) => {
  if (garant.locataireConcerneNom || garant.locataireConcernePrenom) {
    return `
Locataire concerné par le garant ${index + 1} :
- Nom : ${garant.locataireConcernePrenom || ''} ${garant.locataireConcerneNom || ''}
- Email : ${garant.locataireConcerneEmail || '-'}
- Téléphone : ${garant.locataireConcerneTelephone || '-'}
`
  }
  return ''
}).join('\n')}

PDF COMPLET JOINT
  `.trim()
}

export function generateLocataireEmailHTML(data: {
  formData: any
  timestamp: string
}): string {
  const { formData } = data
  const { locataires, criteresRecherche, garanties, bienConcerne, nombreEnfantsFoyer } = formData
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
        <div style="background-color:#fff5f5;border:1px solid #fecdd3;color:#b91c1c;padding:10px 12px;border-radius:6px;margin-bottom:16px;font-weight:600;font-size:13px;">
          ⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.<br />
          Pour toute question, contactez l’agence au 02 98 26 71 47 ou par mail à contact@alvimmobilier.bzh.
        </div>
        
        <h1 style="color: #0072BC; margin: 0 0 20px 0;">Nouveau formulaire locataire reçu</h1>
        
        <!-- Résumé général -->
        <div style="background-color: #f0f9ff; border-left: 4px solid #0072BC; padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #0072BC; margin: 0 0 10px 0; font-size: 16px;">📊 Résumé général</h2>
            <p style="margin: 5px 0;"><strong>Bien concerné :</strong> ${bienConcerne || '-'}</p>
            <p style="margin: 5px 0;"><strong>Nombre de locataires :</strong> ${locataires.length}</p>
            <p style="margin: 5px 0;"><strong>Enfants dans le foyer :</strong> ${nombreEnfantsFoyer || 0}</p>
            <p style="margin: 5px 0;"><strong>Date de soumission :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>

        <!-- Locataires -->
        <div style="margin-bottom: 20px;">
            <h2 style="color: #0072BC; margin: 0 0 15px 0; font-size: 16px;">👥 Locataire(s)</h2>
            ${locataires.map((locataire: any, index: number) => `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 10px; border-radius: 6px;">
                    <h3 style="color: #0072BC; margin: 0 0 10px 0; font-size: 14px;">Locataire ${index + 1}</h3>
                    <p style="margin: 3px 0;"><strong>Nom :</strong> ${locataire.prenom} ${locataire.nom}</p>
                    <p style="margin: 3px 0;"><strong>Civilité :</strong> ${locataire.civilite || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Situation :</strong> ${locataire.situationConjugale || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Adresse :</strong> ${locataire.adresseActuelle || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Téléphone :</strong> ${locataire.telephone || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Email :</strong> ${locataire.email || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Profession :</strong> ${locataire.profession || '-'}</p>
                    <p style="margin: 3px 0;"><strong>Employeur :</strong> ${locataire.employeurNom || '-'}</p>
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 2px 0; font-weight: bold; color: #0072BC;">Revenus mensuels :</p>
                        ${locataire.salaireNet ? `<p style="margin: 2px 0;"><strong>Salaire net :</strong> ${locataire.salaireNet} €</p>` : ''}
                        ${locataire.indemnitesChomage ? `<p style="margin: 2px 0;"><strong>Indemnités chômage :</strong> ${locataire.indemnitesChomage} €</p>` : ''}
                        ${locataire.aahAllocationsHandicap ? `<p style="margin: 2px 0;"><strong>AAH / Allocations handicap :</strong> ${locataire.aahAllocationsHandicap} €</p>` : ''}
                        ${locataire.rsa ? `<p style="margin: 2px 0;"><strong>RSA :</strong> ${locataire.rsa} €</p>` : ''}
                        ${locataire.pension ? `<p style="margin: 2px 0;"><strong>Pension :</strong> ${locataire.pension} €</p>` : ''}
                        ${locataire.revenusAutoEntrepreneur ? `<p style="margin: 2px 0;"><strong>Revenus auto-entrepreneur :</strong> ${locataire.revenusAutoEntrepreneur} €</p>` : ''}
                        ${locataire.aidesAuLogement ? `<p style="margin: 2px 0;"><strong>Aides au logement :</strong> ${locataire.aidesAuLogement} €</p>` : ''}
                        ${!locataire.salaireNet && !locataire.indemnitesChomage && !locataire.aahAllocationsHandicap && !locataire.rsa && !locataire.pension && !locataire.revenusAutoEntrepreneur && !locataire.aidesAuLogement ? '<p style="margin: 2px 0; color: #6b7280;">Aucun revenu renseigné</p>' : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Critères de recherche -->
        <div style="margin-bottom: 20px;">
            <h2 style="color: #0072BC; margin: 0 0 15px 0; font-size: 16px;">🔍 Critères de recherche</h2>
            <div style="background-color: #f0f9ff; border-left: 4px solid #0072BC; padding: 15px; border-radius: 0 4px 4px 0;">
                <p style="margin: 3px 0;"><strong>Chambres souhaitées :</strong> ${criteresRecherche.nombreChambres || '-'}</p>
                <p style="margin: 3px 0;"><strong>Secteur souhaité :</strong> ${criteresRecherche.secteurSouhaite || '-'}</p>
                <p style="margin: 3px 0;"><strong>Rayon de recherche :</strong> ${criteresRecherche.rayonKm ? criteresRecherche.rayonKm + ' km' : '-'}</p>
                <p style="margin: 3px 0;"><strong>Date d'emménagement :</strong> ${criteresRecherche.dateEmmenagement || '-'}</p>
                <p style="margin: 3px 0;"><strong>Loyer maximum :</strong> ${criteresRecherche.loyerMax ? criteresRecherche.loyerMax + ' €' : '-'}</p>
                <p style="margin: 3px 0;"><strong>Raison du déménagement :</strong> ${criteresRecherche.raisonDemenagement || '-'}</p>
            </div>
        </div>

        <!-- Garanties -->
        <div style="margin-bottom: 20px;">
            <h2 style="color: #0072BC; margin: 0 0 15px 0; font-size: 16px;">🛡️ Garanties</h2>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 4px 4px 0;">
                <p style="margin: 3px 0;"><strong>Garant familial :</strong> ${garanties.garantFamilial || '-'}</p>
                <p style="margin: 3px 0;"><strong>Garantie Visale :</strong> ${garanties.garantieVisale || '-'}</p>
                <p style="margin: 3px 0;"><strong>Précisions :</strong> ${garanties.precisionGarant || '-'}</p>
            </div>
        </div>

        <!-- PDF Notice -->
        <div style="background-color: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; text-align: center; margin-top: 20px; border-radius: 6px;">
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
  const { locataires, criteresRecherche, garanties, bienConcerne, nombreEnfantsFoyer } = formData
  
  return `
⚠️ Ce message est envoyé automatiquement. Merci de ne pas y répondre.
Pour toute question, contactez l’agence au 02 98 26 71 47 ou par mail à contact@alvimmobilier.bzh.

NOUVEAU FORMULAIRE LOCATAIRE REÇU - ALV IMMOBILIER

RÉSUMÉ GÉNÉRAL :
- Bien concerné : ${bienConcerne || '-'}
- Nombre de locataires : ${locataires.length}
- Enfants dans le foyer : ${nombreEnfantsFoyer || 0}
- Date de soumission : ${new Date().toLocaleString('fr-FR')}

LOCATAIRE(S) :
${locataires.map((locataire: any, index: number) => `
Locataire ${index + 1} :
- Nom : ${locataire.prenom} ${locataire.nom}
- Civilité : ${locataire.civilite || '-'}
- Situation : ${locataire.situationConjugale || '-'}
- Adresse : ${locataire.adresseActuelle || '-'}
- Téléphone : ${locataire.telephone || '-'}
- Email : ${locataire.email || '-'}
- Profession : ${locataire.profession || '-'}
- Employeur : ${locataire.employeurNom || '-'}
- Revenus mensuels :
${locataire.salaireNet ? `  - Salaire net : ${locataire.salaireNet} €` : ''}
${locataire.indemnitesChomage ? `  - Indemnités chômage : ${locataire.indemnitesChomage} €` : ''}
${locataire.aahAllocationsHandicap ? `  - AAH / Allocations handicap : ${locataire.aahAllocationsHandicap} €` : ''}
${locataire.rsa ? `  - RSA : ${locataire.rsa} €` : ''}
${locataire.pension ? `  - Pension : ${locataire.pension} €` : ''}
${locataire.revenusAutoEntrepreneur ? `  - Revenus auto-entrepreneur : ${locataire.revenusAutoEntrepreneur} €` : ''}
${locataire.aidesAuLogement ? `  - Aides au logement : ${locataire.aidesAuLogement} €` : ''}
${!locataire.salaireNet && !locataire.indemnitesChomage && !locataire.aahAllocationsHandicap && !locataire.rsa && !locataire.pension && !locataire.revenusAutoEntrepreneur && !locataire.aidesAuLogement ? '  - Aucun revenu renseigné' : ''}
`).join('\n')}

CRITÈRES DE RECHERCHE :
- Chambres souhaitées : ${criteresRecherche.nombreChambres || '-'}
- Secteur souhaité : ${criteresRecherche.secteurSouhaite || '-'}
- Rayon de recherche : ${criteresRecherche.rayonKm ? criteresRecherche.rayonKm + ' km' : '-'}
- Date d'emménagement : ${criteresRecherche.dateEmmenagement || '-'}
- Loyer maximum : ${criteresRecherche.loyerMax ? criteresRecherche.loyerMax + ' €' : '-'}
- Raison du déménagement : ${criteresRecherche.raisonDemenagement || '-'}

GARANTIES :
- Garant familial : ${garanties.garantFamilial || '-'}
- Garantie Visale : ${garanties.garantieVisale || '-'}
- Précisions : ${garanties.precisionGarant || '-'}

PDF + CSV (import CRM) JOINTS
  `.trim()
}
