import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { sendMail } from "@/lib/mail"
import { generateGarantPdf, buildGarantPdfFilename } from "@/lib/pdf-garant-generator"
import { generateGarantEmailHTML, generateGarantEmailText } from "@/lib/email-templates"
import type { GarantFormData } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Génération PDF Garant demandée', { body })
    
    const { garants, cautionnes } = body
    
    // Préparer les données pour le PDF
    const pdfData: GarantFormData = {
      garant: garants[0], // Premier garant requis par le type
      garants: garants,
      cautionnes: cautionnes
    }
    
    // Générer le PDF
    const pdfBuffer = await generateGarantPdf(pdfData)
    const filename = buildGarantPdfFilename(pdfData)
    
    logger.info('PDF généré avec succès', { filename, size: pdfBuffer.length })
    
    // Générer le contenu de l'email avec le template professionnel
    const emailData = {
      garants,
      cautionnes,
      timestamp: new Date().toISOString()
    }
    
    const emailHTML = generateGarantEmailHTML(emailData)
    const emailText = generateGarantEmailText(emailData)

    // Envoyer l'email avec le PDF en pièce jointe
    await sendMail({
      to: process.env.RECIPIENT_EMAIL || 'foveau16@gmail.com',
      cc: garants[0]?.email || undefined, // Copie à l'utilisateur
      subject: `Nouveau formulaire garant - ${garants[0]?.nom} ${garants[0]?.prenom}`,
      html: emailHTML,
      attachments: [{
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    })
    
    logger.info('Email avec PDF envoyé avec succès pour le formulaire garant')
    
    return NextResponse.json({
      success: true,
      message: 'Formulaire envoyé avec succès !',
      pdfGenerated: true,
      filename: filename,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Erreur lors de la génération PDF Garant', { error })
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
    message: 'API génération PDF Garant - Utilisez POST avec les données du formulaire',
    endpoints: {
      POST: 'Générer un PDF Garant avec les données fournies'
    }
  })
}
