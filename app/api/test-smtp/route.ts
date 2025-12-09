import { NextResponse } from "next/server"
import { smtpDiagnostics } from "@/lib/mail"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    logger.info("Test de configuration SMTP demandé")
    const diagnostics = await smtpDiagnostics()
    
    return NextResponse.json({
      success: true,
      diagnostics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error("Erreur lors du diagnostic SMTP", { error })
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du diagnostic SMTP",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
}
