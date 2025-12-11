"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus, 
  FileText, 
  ArrowLeft,
  Send,
  CheckCircle,
  Sparkles,
  Users,
  Shield,
  Info
} from "lucide-react"
import { createTestGarantContact, createTestLocataire } from "@/lib/test-data"
import { TEST_FILL_ENABLED } from "@/lib/feature-flags"
import type { Locataire, GarantContact } from "@/lib/types"
import { LoadingOverlay } from "@/components/loading-overlay"
import { GarantCard } from "@/components/garant-card"
import ErrorMessage from "@/components/error-message"
import { FadeInText, Reveal } from "@/components/react-bits"

// Créer un garant vide
const createEmptyGarant = (): Locataire => ({
  nom: "",
  prenom: "",
  civilite: "",
  situationConjugale: "",
  adresseActuelle: "",
  telephone: "",
  email: "",
  dateNaissance: "",
  lieuNaissance: "",
  situationActuelle: "",
  preavisADeposer: "",
  dureePreavise: "",
  dureePreaviseAutre: "",
  hebergeParQui: "",
  profession: "",
  etablissementFormation: "",
  employeurNom: "",
  employeurAdresse: "",
  employeurTelephone: "",
  dateEmbauche: "",
  typeContrat: "",
  salaire: "",
  salaireNet: "",
  indemnitesChomage: "",
  aahAllocationsHandicap: "",
  rsa: "",
  pension: "",
  revenusAutoEntrepreneur: "",
  aidesAuLogement: "",
  revenusAdditionnels: [],
  dateFinContrat: "",
  dureeInscriptionInterim: "",
  agenceInterim: "",
  dateDebutActivite: "",
  regimeRetraite: "",
  dateDebutRetraite: "",
  alternance: "",
  typeAlternance: "",
  situationActuelleSansEmploi: "",
  origineRevenuPrincipal: "",
  origineRevenuPrincipalAutre: "",
  locataireConcerneNom: "",
  locataireConcernePrenom: "",
  locataireConcerneEmail: "",
  locataireConcerneTelephone: "",
})


export default function GarantFormPage() {
  const router = useRouter()
  const [garants, setGarants] = useState<Locataire[]>([
    createEmptyGarant()
  ])
  const [cautionnes, setCautionnes] = useState<GarantContact[]>([])
  
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)


  // Fonction pour mettre à jour un champ d'un garant
  const updateGarantField = useCallback((index: number, field: string, value: string) => {
    setGarants(prev => prev.map((garant, i) => 
      i === index ? { ...garant, [field]: value } : garant
    ))
    // Remettre showValidationErrors à false quand l'utilisateur modifie un champ
    if (showValidationErrors) {
      setShowValidationErrors(false)
    }
  }, [showValidationErrors])

  // Fonctions mémorisées pour les gestionnaires de champs des garants
  const createGarantFieldHandlers = useMemo(() => {
    return (index: number) => ({
      onChange: (field: string, value: string) => updateGarantField(index, field, value),
      onEdit: (field: string) => setEditingField(`garant_${index}_${field}`),
      onBlur: () => setEditingField(null)
    })
  }, [updateGarantField])

  // Fonction pour ajouter un garant
  const addGarant = () => {
    setGarants(prev => [...prev, createEmptyGarant()])
    setEditingField(null) // Réinitialiser l'état d'édition
    toast.success(`Garant ${garants.length + 1} ajouté !`)
  }

  // Fonction pour supprimer un garant
  const removeGarant = (index: number) => {
    if (garants.length > 1) {
      setGarants(prev => prev.filter((_, i) => i !== index))
      toast.success(`Garant ${index + 1} supprimé !`)
    }
  }

  const requiredFields: (keyof Locataire)[] = [
    "nom",
    "prenom",
    "civilite",
    "dateNaissance",
    "lieuNaissance",
    "adresseActuelle",
    "telephone",
    "email",
    "typeContrat"
  ]

  const computeMissingPaths = () => {
    const paths: string[] = []
    garants.forEach((garant, index) => {
      requiredFields.forEach((field) => {
        const value = garant[field]
        if (!value || (typeof value === "string" && value.trim() === "")) {
          paths.push(`garant_${index}_${field}`)
        }
      })
    })
    return paths
  }

  const isFormComplete = (): boolean => computeMissingPaths().length === 0

  const scrollToFirstMissing = (paths: string[]) => {
    if (!paths.length) return
    const firstId = `field-${paths[0].replace(/[^a-zA-Z0-9_-]/g, "-")}`
    const el = document.getElementById(firstId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }
    
  // Fonction pour soumettre le formulaire
  const handleSubmit = async () => {
    const missing = computeMissingPaths()
    if (missing.length) {
      setShowValidationErrors(true)
      toast.error("Veuillez completer les champs obligatoires.")
      scrollToFirstMissing(missing)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null) // Effacer toute erreur précédente
    
    try {
      const formData = {
        garants,
        cautionnes,
        timestamp: new Date().toISOString()
      }

      const response = await fetch('/api/generer-pdf-garant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      let result
      try {
        result = await response.json()
      } catch (e) {
        console.error('Erreur parsing JSON:', e)
        setErrorMessage("Erreur lors de la lecture de la réponse du serveur.")
        return
      }

      if (!response.ok) {
        const detail = result?.error || result?.details || `Erreur serveur (${response.status})`
        setErrorMessage(detail)
        console.error('Erreur serveur:', result)
        return
      }

      if (result.success && result.emailSent) {
        setIsSuccess(true)
        // Ne plus rediriger vers la page de confirmation
      } else if (result.success && !result.emailSent) {
        setErrorMessage("Le formulaire a été généré mais l'email n'a pas pu être envoyé. Veuillez contacter l'agence.")
      } else {
        const detail = result?.details || result?.error || "Une erreur s'est produite lors de l'envoi. Veuillez réessayer."
        setErrorMessage(detail)
      }
    } catch (error) {
      console.error(error)
      setErrorMessage("Une erreur s'est produite lors de l'envoi. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAutofill = () => {
    const cautionne = createTestGarantContact("locataire")
    const sampleGarant = createTestLocataire(1, {
      locataireConcerneNom: cautionne.nom,
      locataireConcernePrenom: cautionne.prenom,
      locataireConcerneEmail: cautionne.email,
      locataireConcerneTelephone: cautionne.telephone
    })
    setGarants([sampleGarant])
    setCautionnes([cautionne])
    setEditingField(null)
    setShowValidationErrors(false)
    setErrorMessage(null)
    toast.success("Champs préremplis avec des données fictives pour vos tests PDF.")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LoadingOverlay 
        show={isSubmitting || isSuccess} 
        isSuccess={isSuccess}
        onClose={() => router.push('/')}
      />
      
      {errorMessage && (
        <ErrorMessage 
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 pt-safe shadow-sm">
        <div className="max-w-6xl mx-auto space-y-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.push('/')}
            className="flex items-center gap-3 h-14 px-6 text-base"
          >
            <ArrowLeft className="h-6 w-6" />
            Retour
          </Button>

          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  <FadeInText text="Fiche de renseignements garant" />
                </h1>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200">Je me porte cautionnaire</Badge>
                {TEST_FILL_ENABLED && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAutofill}
                    className="h-8 px-2.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 shadow-none hover:bg-purple-100"
                  >
                    <Sparkles className="h-4 w-4" />
                    Remplir en test
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Hero contextualise */}
        <Reveal>
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white">
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-32 -bottom-28 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl" />
          <CardHeader className="relative space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                <FadeInText text="Complétez votre dossier de caution en quelques étapes" />
              </CardTitle>
            </div>
            <p className="text-sm sm:text-base text-white/80">
              Renseignez vos informations de garant (identité, lien avec le locataire, revenus, type de caution) dans un formulaire guidé.
              Temps estimé : 5 à 10 minutes – vous recevrez un récapitulatif par email.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Info className="h-4 w-4" />
              <span>Données fictives générées automatiquement pour vérifier l’envoi des PDF.</span>
            </div>
          </CardHeader>
          <CardContent className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {[
              { icon: <Users className="h-4 w-4" />, label: "Garants", step: 1 },
              { icon: <Shield className="h-4 w-4" />, label: "Lien avec le locataire", step: 2 },
              { icon: <CheckCircle className="h-4 w-4" />, label: "Revenus & contrat", step: 3 },
              { icon: <FileText className="h-4 w-4" />, label: "Vérification & envoi", step: 4 }
            ].map((pill) => (
              <div key={pill.label} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/15 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-xs font-semibold">
                    {pill.step}
                  </span>
                  {pill.icon}
                </div>
                <span>{pill.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        </Reveal>

        {/* Garants */}
        <div className="space-y-4">
          <Reveal>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 sm:px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Garants ({garants.length})</CardTitle>
                <p className="text-sm text-slate-600">Identite et type de contrat obligatoires, le reste en option.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Badges "Rempli" pour suivre l'avancement</span>
              </div>
              <Button
                onClick={addGarant}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="h-4 w-4" />
                Ajouter un garant
              </Button>
            </div>
          </div>
          </Reveal>

          <div className="space-y-4">
            {garants.map((garant, garantIndex) => {
              const handlers = createGarantFieldHandlers(garantIndex)
              return (
                <Reveal key={`garant-${garantIndex}`} delay={garantIndex * 50}>
                <GarantCard
                  garant={garant}
                  garantIndex={garantIndex}
                  editingField={editingField}
                  onFieldChange={handlers.onChange}
                  onFieldEdit={handlers.onEdit}
                  onFieldBlur={handlers.onBlur}
                  onRemove={() => removeGarant(garantIndex)}
                  canRemove={garants.length > 1}
                  showValidationErrors={showValidationErrors}
                />
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Boutons d'action */}
        <Reveal>
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6 space-y-4 flex flex-col items-center">
            {isFormComplete() && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-800 font-medium">
                  Formulaire complet - Pret a envoyer !
                </span>
              </div>
            )}
            {!isFormComplete() && showValidationErrors && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-rose-600" />
                <span className="text-rose-800 text-sm">
                  Merci de remplir les champs obligatoires : Identite et Type de contrat.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Button
                onClick={addGarant}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="h-5 w-5" />
                Ajouter un garant
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
                {isSubmitting ? "Envoi en cours..." : "Envoyer le formulaire"}
              </Button>
            </div>
          </CardContent>
        </Card>
        </Reveal>
      </div>
    </div>
  )
}
