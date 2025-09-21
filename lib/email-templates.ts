// Templates d'email enrichis avec plus d'informations

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
                    <p style="margin: 3px 0;"><strong>Salaire :</strong> ${garant.salaire ? garant.salaire + ' €' : '-'}</p>
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
- Salaire : ${garant.salaire ? garant.salaire + ' €' : '-'}
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
            ${locataires.map((locataire, index) => `
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
                    <p style="margin: 3px 0;"><strong>Salaire :</strong> ${locataire.salaire ? locataire.salaire + ' €' : '-'}</p>
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
NOUVEAU FORMULAIRE LOCATAIRE REÇU - ALV IMMOBILIER

RÉSUMÉ GÉNÉRAL :
- Bien concerné : ${bienConcerne || '-'}
- Nombre de locataires : ${locataires.length}
- Enfants dans le foyer : ${nombreEnfantsFoyer || 0}
- Date de soumission : ${new Date().toLocaleString('fr-FR')}

LOCATAIRE(S) :
${locataires.map((locataire, index) => `
Locataire ${index + 1} :
- Nom : ${locataire.prenom} ${locataire.nom}
- Civilité : ${locataire.civilite || '-'}
- Situation : ${locataire.situationConjugale || '-'}
- Adresse : ${locataire.adresseActuelle || '-'}
- Téléphone : ${locataire.telephone || '-'}
- Email : ${locataire.email || '-'}
- Profession : ${locataire.profession || '-'}
- Employeur : ${locataire.employeurNom || '-'}
- Salaire : ${locataire.salaire ? locataire.salaire + ' €' : '-'}
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

PDF COMPLET JOINT
  `.trim()
}