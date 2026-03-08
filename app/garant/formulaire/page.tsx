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
  Users,
  Shield,
  Info,
  Mail,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  FlaskConical
} from "lucide-react"
import { createTestGarantContact, createTestLocataire } from "@/lib/test-data"
import { TEST_FILL_ENABLED } from "@/lib/feature-flags"
import type { Locataire, GarantContact } from "@/lib/types"
import { LoadingOverlay } from "@/components/loading-overlay"
import { GarantCard } from "@/components/garant-card"
import ErrorMessage from "@/components/error-message"
import { FadeInText, Reveal } from "@/components/react-bits"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const CAUTIONNAIRE_MAILTO_SUBJECT = encodeURIComponent(
  "Envoi de pièces justificatives - Dossier cautionnaire"
)

const CAUTIONNAIRE_MAILTO_BODY = encodeURIComponent(
  "Bonjour,\n\nVeuillez trouver ci-joint les pièces justificatives demandées pour mon dossier cautionnaire.\n\nNom :\nPrénom :\nNom du locataire concerné (si connu) :\n\nCordialement,"
)

const CAUTIONNAIRE_MAILTO_HREF = `mailto:contact@alvimmobilier.bzh?subject=${CAUTIONNAIRE_MAILTO_SUBJECT}&body=${CAUTIONNAIRE_MAILTO_BODY}`

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
  pensionRetraite: "",
  pensionReversion: "",
  pensionAlimentaire: "",
  revenusAutoEntrepreneur: "",
  autreRevenu: "",
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
  
  const [showPiecesJustificatives, setShowPiecesJustificatives] = useState(false)
  const [showTestConfirmDialog, setShowTestConfirmDialog] = useState(false)
  const [showRemoveGarantDialog, setShowRemoveGarantDialog] = useState(false)
  const [indexToRemoveGarant, setIndexToRemoveGarant] = useState<number>(0)
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

  const REVENU_KEYS = [
    "salaireNet",
    "indemnitesChomage",
    "pensionRetraite",
    "pensionReversion",
    "pensionAlimentaire",
    "aahAllocationsHandicap",
    "rsa",
    "pension",
    "revenusAutoEntrepreneur",
    "autreRevenu",
    "aidesAuLogement",
  ] as const

  const hasAtLeastOneRevenu = (garant: Locataire): boolean =>
    REVENU_KEYS.some(
      (key) => garant[key] != null && String(garant[key]).trim() !== ""
    )

  const requiredFields: (keyof Locataire)[] = [
    "nom",
    "prenom",
    "civilite",
    "dateNaissance",
    "lieuNaissance",
    "adresseActuelle",
    "telephone",
    "email",
    "typeContrat",
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
      if (!hasAtLeastOneRevenu(garant)) {
        paths.push(`garant_${index}_revenusMensuels`)
      }
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
    toast.success("Champs préremplis.")
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

      {/* Dialog confirmation suppression garant */}
      <AlertDialog open={showRemoveGarantDialog} onOpenChange={setShowRemoveGarantDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le garant</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce garant ? Cette action est irréversible.
              {garants[indexToRemoveGarant] && (
                <>
                  <br />
                  <strong>
                    Garant {indexToRemoveGarant + 1} : {garants[indexToRemoveGarant].prenom} {garants[indexToRemoveGarant].nom}
                  </strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeGarant(indexToRemoveGarant)
                setShowRemoveGarantDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
                  <>
                    <button
                      type="button"
                      onClick={() => setShowTestConfirmDialog(true)}
                      title="Préremplir"
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded border-0 bg-transparent cursor-pointer"
                    >
                      <FlaskConical className="h-3 w-3" />
                    </button>
                    <AlertDialog open={showTestConfirmDialog} onOpenChange={setShowTestConfirmDialog}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Préremplir le formulaire</AlertDialogTitle>
                          <AlertDialogDescription>
                            Les champs du formulaire seront préremplis. Cette action remplace tout le contenu actuel.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleAutofill}>
                            Préremplir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
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

        {/* Pièces justificatives à prévoir - bouton déroulant */}
        <Reveal delay={40}>
        <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPiecesJustificatives(!showPiecesJustificatives)}
            className="w-full px-4 sm:px-6 py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <Info className="h-5 w-5" />
              </div>
              <span className="font-semibold text-slate-900">
                Pièces justificatives à prévoir
              </span>
            </div>
            {showPiecesJustificatives ? (
              <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />
            )}
          </button>
          {showPiecesJustificatives && (
            <CardContent className="border-t border-slate-200 px-4 sm:px-6 py-4 space-y-4 text-sm text-slate-700">
              <div className="flex items-start justify-between gap-3">
                <p className="text-slate-600">
                  La fiche de renseignements vous permet de préparer votre dossier cautionnaire.
                  Si le dossier locataire est retenu ou en cours d’étude, nous pourrons vous demander les pièces justificatives ci-dessous afin de compléter le dossier transmis au propriétaire.
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPiecesJustificatives(false)}
                  className="flex-shrink-0 rounded-full h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-900">Justificatif de domicile</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>3 dernières quittances de loyer si vous êtes locataire</li>
                <li>ou attestation d’hébergement si vous êtes hébergé(e)</li>
                <li>ou dernière taxe foncière si vous êtes propriétaire</li>
              </ul>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-slate-900">Justificatifs de ressources</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>dernier avis d’imposition</li>
                <li>ou les 2 derniers avis d’imposition en cas de location « loi Pinel »</li>
              </ul>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-slate-900">Justificatifs d’activité professionnelle</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>contrat de travail</li>
                <li>3 derniers bulletins de salaire</li>
                <li>ou 2 derniers bilans pour les travailleurs indépendants</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <a href={CAUTIONNAIRE_MAILTO_HREF}>
                  <Mail className="h-4 w-4" />
                  Envoyer mes pièces
                </a>
              </Button>
            </div>
          </CardContent>
          )}
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
                <p className="text-sm text-slate-600">Identite et situation professionnelle obligatoires, le reste en option.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
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
              {garants.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer un garant
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {garants.map((garant, index) => (
                      <DropdownMenuItem
                        key={index}
                        onSelect={(e) => {
                          e.preventDefault()
                          setIndexToRemoveGarant(index)
                          setShowRemoveGarantDialog(true)
                        }}
                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                      >
                        Garant {index + 1} : {garant.prenom || "—"} {garant.nom || "—"}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
                  Merci de remplir les champs obligatoires : identité, situation professionnelle et au moins un revenu mensuel par garant.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
              <Button
                onClick={addGarant}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="h-5 w-5" />
                Ajouter un garant
              </Button>
              {garants.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                      Supprimer un garant
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    {garants.map((garant, index) => (
                      <DropdownMenuItem
                        key={index}
                        onSelect={(e) => {
                          e.preventDefault()
                          setIndexToRemoveGarant(index)
                          setShowRemoveGarantDialog(true)
                        }}
                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                      >
                        Garant {index + 1} : {garant.prenom || "—"} {garant.nom || "—"}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
