import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { sendMail } from "@/lib/mail"
import { generatePdf, buildLocatairePdfFilename } from "@/lib/pdf-generator"
import { generateRecherchePdf, buildRecherchePdfFilename } from "@/lib/pdf-recherche-generator"
import { generateLocataireEmailHTML, generateLocataireEmailText } from "@/lib/email-templates"
import { buildLeadCsvFilename, generateLeadCsvBuffer } from "@/lib/csv-generator"
import type { AppFormData, Locataire } from "@/lib/types"

function formatCivilitePrefix(civilite?: string) {
  const normalized = civilite?.trim().toLowerCase()
  if (normalized === "monsieur") return "M."
  if (normalized === "madame") return "Mme"
  return ""
}

function formatLocataireSubjectName(locataire?: Partial<Locataire>) {
  if (!locataire) return ""
  const civilite = formatCivilitePrefix(locataire.civilite)
  const nom = (locataire.nom || "").trim().toUpperCase()
  const prenom = (locataire.prenom || "").trim()

  if (civilite && nom) return `${civilite} ${nom}`
  if (nom) return nom
  if (civilite && prenom) return `${civilite} ${prenom}`
  return prenom
}

function buildLocataireSubject(locataires: Partial<Locataire>[] | undefined) {
  const formatted = (locataires || [])
    .map((loc) => formatLocataireSubjectName(loc))
    .filter((val) => !!val)

  if (!formatted.length) return "Nouveau formulaire locataire"
  return `Nouveau formulaire locataire - ${formatted.join(" / ")}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Génération PDF Locataire demandée', { body })
    
    const formData: AppFormData = body
    
    // Générer le PDF principal (locataire)
    let pdfBuffer: Buffer
    let filename: string
    try {
      pdfBuffer = await generatePdf(formData)
      filename = buildLocatairePdfFilename(formData)
    } catch (e: any) {
      const msg = e?.message || String(e)
      throw new Error(`PDF locataire: ${msg}`)
    }
    
    logger.info('PDF principal généré avec succès', { filename, size: pdfBuffer.length })
    
    // Générer le PDF critères de recherche (si demandé)
    let recherchePdfBuffer: Buffer | null = null
    let rechercheFilename: string | null = null
    
    if (formData.veutRemplirRecherche === "oui") {
      try {
        recherchePdfBuffer = await generateRecherchePdf(formData)
        rechercheFilename = buildRecherchePdfFilename(formData)
      } catch (e: any) {
        const msg = e?.message || String(e)
        throw new Error(`PDF recherche: ${msg}`)
      }
      logger.info('PDF critères de recherche généré avec succès', { filename: rechercheFilename, size: recherchePdfBuffer.length })
    }
    
    // Générer le CSV compatible CRM (ImmoFacile / AC3)
    let csvBuffer: Buffer
    let csvFilename: string
    try {
      csvBuffer = generateLeadCsvBuffer(formData)
      csvFilename = buildLeadCsvFilename(formData)
    } catch (e: any) {
      logger.error('Erreur génération CSV', { error: e, formData: { locatairesCount: formData.locataires?.length } })
      const msg = e?.message || (typeof e === 'string' ? e : String(e))
      throw new Error(`CSV lead: ${msg}`)
    }
    logger.info('CSV lead généré avec succès', { filename: csvFilename, size: csvBuffer.length })

    // Générer le contenu de l'email avec le template professionnel
    const emailData = {
      formData,
      timestamp: new Date().toISOString()
    }
    
    const emailHTML = generateLocataireEmailHTML(emailData)
    const emailText = generateLocataireEmailText(emailData)

    // Préparer les pièces jointes
    const attachments = [
      {
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      },
      {
        filename: csvFilename,
        content: csvBuffer,
        contentType: 'text/csv'
      }
    ]
    
    // Ajouter le PDF critères de recherche si généré
    if (recherchePdfBuffer && rechercheFilename) {
      attachments.push({
        filename: rechercheFilename,
        content: recherchePdfBuffer,
        contentType: 'application/pdf'
      })
    }

    // Envoyer l'email avec les PDFs en pièces jointes
    let mailOk = false
    try {
      const subject = buildLocataireSubject(formData.locataires)
      mailOk = await sendMail({
        to: process.env.RECIPIENT_EMAIL || 'foveau16@gmail.com',
        cc: formData.locataires[0]?.email || undefined, // Copie à l'utilisateur
        subject,
        html: emailHTML,
        attachments: attachments
      })
    } catch (e: any) {
      logger.error('sendMail: exception', e)
      mailOk = false
    }
    
    if (mailOk) {
      logger.info('Email avec PDF envoyé avec succès pour le formulaire locataire')
    } else {
      logger.warn('Email non envoyé (config SMTP absente ou erreur), génération PDF/CSV OK')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Formulaire envoyé avec succès !',
      pdfGenerated: true,
      filename: filename,
      recherchePdfGenerated: recherchePdfBuffer ? true : false,
      rechercheFilename: rechercheFilename,
      emailSent: !!mailOk,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Erreur lors de la génération PDF Locataire', { error })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'envoi du formulaire',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined,
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
