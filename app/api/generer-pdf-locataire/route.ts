import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { sendMail } from "@/lib/mail"
import { generatePdf, buildLocatairePdfFilename } from "@/lib/pdf-generator"
import { generateRecherchePdf, buildRecherchePdfFilename } from "@/lib/pdf-recherche-generator"
import { generateLocataireEmailHTML, generateLocataireEmailText } from "@/lib/email-templates"
import type { AppFormData } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Génération PDF Locataire demandée', { body })
    
    const formData: AppFormData = body
    
    // Générer le PDF principal (locataire)
    const pdfBuffer = await generatePdf(formData)
    const filename = buildLocatairePdfFilename(formData)
    
    logger.info('PDF principal généré avec succès', { filename, size: pdfBuffer.length })
    
    // Générer le PDF critères de recherche (si demandé)
    let recherchePdfBuffer: Buffer | null = null
    let rechercheFilename: string | null = null
    
    if (formData.veutRemplirRecherche === "oui") {
      recherchePdfBuffer = await generateRecherchePdf(formData)
      rechercheFilename = buildRecherchePdfFilename(formData)
      logger.info('PDF critères de recherche généré avec succès', { filename: rechercheFilename, size: recherchePdfBuffer.length })
    }
    
    // Générer le contenu de l'email avec le template professionnel
    const emailData = {
      formData,
      timestamp: new Date().toISOString()
    }
    
    const emailHTML = generateLocataireEmailHTML(emailData)
    const emailText = generateLocataireEmailText(emailData)

    // Préparer les pièces jointes
    const attachments = [{
      filename: filename,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }]
    
    // Ajouter le PDF critères de recherche si généré
    if (recherchePdfBuffer && rechercheFilename) {
      attachments.push({
        filename: rechercheFilename,
        content: recherchePdfBuffer,
        contentType: 'application/pdf'
      })
    }

    // Envoyer l'email avec les PDFs en pièces jointes
    await sendMail({
      to: process.env.RECIPIENT_EMAIL || 'contact@alvimobilier.bzh',
      subject: `Nouveau formulaire locataire - ${formData.locataires[0]?.nom} ${formData.locataires[0]?.prenom}`,
      html: emailHTML,
      attachments: attachments
    })
    
    logger.info('Email avec PDF envoyé avec succès pour le formulaire locataire')
    
    return NextResponse.json({
      success: true,
      message: 'Formulaire envoyé avec succès !',
      pdfGenerated: true,
      filename: filename,
      recherchePdfGenerated: recherchePdfBuffer ? true : false,
      rechercheFilename: rechercheFilename,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Erreur lors de la génération PDF Locataire', { error })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'envoi du formulaire',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API génération PDF Locataire - Utilisez POST avec les données du formulaire',
    endpoints: {
      POST: 'Génère un PDF et envoie un email avec le formulaire locataire'
    }
  })
}
