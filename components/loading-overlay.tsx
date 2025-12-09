"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, FileText, CheckCircle2, Clock } from "lucide-react"

type LoadingOverlayProps = {
  show?: boolean
  message?: string
  isSuccess?: boolean
  onClose?: () => void
}

export function LoadingOverlay({
  show = false,
  message = "Veuillez patienter… Votre dossier est en cours de traitement",
  isSuccess = false,
  onClose
}: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    "Préparation des données...",
    "Génération du PDF...",
    "Envoi de l'email...",
    "Finalisation..."
  ]

  const successSteps = [
    "✅ Formulaire envoyé avec succès !",
    "📄 PDF généré",
    "📧 Email envoyé",
    "🎉 Terminé !"
  ]

  useEffect(() => {
    if (!show) return
    
    setProgress(0)
    setCurrentStep(0)
    
    if (isSuccess) {
      // Mode succès : animation rapide vers 100%
      setProgress(100)
      setCurrentStep(successSteps.length - 1)
      return
    }
    
    // Animation du progrès avec étapes synchronisées
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        return p + 0.5 // Plus lent pour être plus réaliste
      })
    }, 100)

    // Changement d'étapes synchronisé avec la progression
    const stepInterval = setInterval(() => {
      setCurrentStep((s) => {
        if (s >= steps.length - 1) return s
        return s + 1
      })
    }, 3000) // Plus long pour chaque étape

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [show, isSuccess])

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Traitement du dossier en cours"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      {/* Carte de contenu centrée */}
      <div
        role="status"
        aria-live="polite"
        className="relative z-[101] w-[95%] max-w-lg rounded-2xl border-0 bg-white/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-300"
      >
        <div className="flex flex-col items-center text-center gap-6">
          {/* Logo ALV avec indicateur de chargement/succès */}
          <div className="relative">
            <Image
              src="/images/logo-alv-2.jpg"
              alt="ALV Immobilier"
              width={200}
              height={52}
              className="h-12 w-auto sm:h-14"
              priority
            />
            <div className="absolute -top-2 -right-2">
              {isSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
              )}
            </div>
          </div>

          {/* Titre et message */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isSuccess ? "Formulaire envoyé avec succès !" : "Génération en cours..."}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-sm">
              {isSuccess 
                ? "Votre formulaire a été envoyé avec succès. Un email de confirmation a été envoyé avec votre dossier PDF."
                : message
              }
            </p>
          </div>

          {/* Barre de progression */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Étapes actuelles */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              {isSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-emerald-600" />
              )}
              <span className="font-medium">
                {isSuccess ? successSteps[currentStep] : steps[currentStep]}
              </span>
            </div>
          </div>

          {/* Indicateurs visuels */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>PDF</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Email</span>
            </div>
          </div>

          {/* Message d'aide ou bouton */}
          {isSuccess ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Retour à l'accueil
              </button>
              <p className="text-xs text-slate-500 text-center">
                Suivez notre agence :{" "}
                <a
                  href="https://www.alvimmobilier.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-700 transition-colors"
                >
                  🌐 Site ALV
                </a>
                {" · "}
                <a
                  href="https://www.instagram.com/alvimmobilier?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-700 transition-colors"
                >
                  📸 Instagram
                </a>
                {" · "}
                <a
                  href="https://www.facebook.com/immobilierALV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-700 transition-colors"
                >
                  📘 Facebook
                </a>
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Vous pouvez fermer cette page en toute sécurité.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 max-w-xs">
              Ne fermez pas cette page. Vous serez redirigé automatiquement une fois terminé.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
