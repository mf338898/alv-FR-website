"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeInText, Reveal } from "@/components/react-bits"
import {
  Plus,
  FileText,
  ArrowLeft,
  Send,
  Users,
  Home,
  Shield,
  CheckCircle,
  Sparkles,
  Info
} from "lucide-react"
import type { AppFormData, Locataire, CriteresRecherche, Garanties } from "@/lib/types"
import { createTestCriteres, createTestGaranties, createTestLocataire } from "@/lib/test-data"
import { LoadingOverlay } from "@/components/loading-overlay"
import { LocataireCard } from "@/components/locataire-card"
import { CriteresRechercheCard } from "@/components/criteres-recherche-card"
import { GarantiesCard } from "@/components/garanties-card"
import ErrorMessage from "@/components/error-message"

// Créer un locataire vide
const createEmptyLocataire = (): Locataire => ({
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
  salaire: "", // Conservé pour compatibilité
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

// Créer des critères de recherche vides
const createEmptyCriteres = (): CriteresRecherche => ({
  rechercheType: "",
  typeBienAchat: "",
  budgetAchat: "",
  financementAchat: "",
  banqueConsultee: "",
  nombreChambres: "",
  secteurSouhaite: "",
  rayonKm: "",
  dateEmmenagement: "",
  preavisADeposer: "",
  raisonDemenagement: "",
  informationsComplementaires: "",
  loyerMax: "",
})

// Créer des garanties vides
const createEmptyGaranties = (): Garanties => ({
  garantFamilial: "non",
  garantieVisale: "non",
  precisionGarant: "",
  garants: [],
})


export default function LocataireFormPage() {
  const router = useRouter()
  const [locataires, setLocataires] = useState<Locataire[]>([
    createEmptyLocataire()
  ])
  const [nombreEnfantsFoyer, setNombreEnfantsFoyer] = useState<number>(0)
  const [criteresRecherche, setCriteresRecherche] = useState<CriteresRecherche>(createEmptyCriteres())
  const [garanties, setGaranties] = useState<Garanties>(createEmptyGaranties())
  const [bienConcerne, setBienConcerne] = useState<string>("")
  const [veutRemplirRecherche, setVeutRemplirRecherche] = useState<string>("non")
  
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
    if (!bienConcerne || bienConcerne.trim() === "") {
      paths.push("bienConcerne")
    }
    locataires.forEach((locataire, index) => {
      requiredFields.forEach((field) => {
        const value = locataire[field]
        if (!value || (typeof value === "string" && value.trim() === "")) {
          paths.push(`locataire_${index}_${field}`)
        }
      })
    })
    return paths
  }

  // Fonction pour vérifier si le formulaire est complet (obligatoires uniquement)
  const isFormComplete = () => computeMissingPaths().length === 0

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

  const handleFieldChange = useCallback((field: string, value: string) => {
    // Remettre showValidationErrors à false quand l'utilisateur modifie un champ
    if (showValidationErrors) {
      setShowValidationErrors(false)
    }

    // Gérer les champs globaux
    if (field === "nombreEnfantsFoyer") {
      setNombreEnfantsFoyer(parseInt(value) || 0)
      return
    }
    if (field === "bienConcerne") {
      setBienConcerne(value)
      return
    }
    if (field === "veutRemplirRecherche") {
      setVeutRemplirRecherche(value)
      return
    }

    // Gérer les champs des locataires
    if (field.startsWith("locataire_")) {
      const [_, index, locataireField] = field.split("_")
      const locataireIndex = parseInt(index)
      setLocataires(prev => prev.map((locataire, i) => 
        i === locataireIndex 
          ? { ...locataire, [locataireField]: value }
          : locataire
      ))
      return
    }

    // Gérer les champs des critères de recherche
    if (field.startsWith("criteres_")) {
      const critereField = field.replace("criteres_", "")
      setCriteresRecherche(prev => ({ ...prev, [critereField]: value }))
      return
    }

    // Gérer les champs des garanties
    if (field.startsWith("garanties_")) {
      const garantieField = field.replace("garanties_", "")
      setGaranties(prev => ({ ...prev, [garantieField]: value }))
      return
    }
  }, [showValidationErrors])

  const handleFieldEdit = useCallback((field: string) => {
    setEditingField(field)
  }, [])

  const handleFieldBlur = useCallback(() => {
    setEditingField(null)
  }, [])

  // Fonctions mémorisées pour les gestionnaires de champs des locataires
  const createLocataireFieldHandlers = useMemo(() => {
    return (index: number) => ({
      onChange: (field: string, value: string) => handleFieldChange(`locataire_${index}_${field}`, value),
      onEdit: (field: string) => handleFieldEdit(`locataire_${index}_${field}`),
      onBlur: handleFieldBlur
    })
  }, [handleFieldChange, handleFieldEdit, handleFieldBlur])

  const addLocataire = () => {
    setLocataires(prev => [...prev, createEmptyLocataire()])
    setEditingField(null) // Réinitialiser l'état d'édition
    toast.success(`Locataire ${locataires.length + 1} ajouté !`)
  }

  const removeLocataire = (index: number) => {
    if (locataires.length > 1) {
      setLocataires(prev => prev.filter((_, i) => i !== index))
      toast.success(`Locataire ${index + 1} supprimé !`)
    }
  }

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
      const formData: AppFormData = {
        bienConcerne,
        locataires,
        nombreEnfantsFoyer,
        criteresRecherche,
        garanties,
        veutRemplirRecherche: veutRemplirRecherche === "oui" ? "oui" : "non",
        dossierFacileLink: ""
      }

      const response = await fetch('/api/generer-pdf-locataire', {
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
        // Si le status HTTP indique une erreur, afficher l'erreur même si success est true
        const detail = result?.error || result?.details || `Erreur serveur (${response.status})`
        setErrorMessage(detail)
        console.error('Erreur serveur:', result)
        return
      }

      if (result.success && result.emailSent) {
        setIsSuccess(true)
        // Ne plus rediriger vers la page de confirmation
      } else if (result.success && !result.emailSent) {
        const detail = "Le formulaire a été généré mais l'email n'a pas pu être envoyé. Veuillez contacter l'agence."
        setErrorMessage(detail)
      } else {
        const detail = result?.details || result?.error || "Une erreur s'est produite lors de l'envoi. Veuillez réessayer."
        setErrorMessage(detail)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      const message = error?.message || "Une erreur s'est produite lors de l'envoi. Veuillez réessayer."
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAutofill = () => {
    // Générer aléatoirement 1, 2 ou 3 locataires avec distribution équilibrée
    const options = [1, 2, 3]
    const nombreLocataires = options[Math.floor(Math.random() * options.length)]
    const sampleLocataires = Array.from({ length: nombreLocataires }, (_, i) => 
      createTestLocataire(i + 1)
    )
    setLocataires(sampleLocataires)
    setNombreEnfantsFoyer(1)
    setBienConcerne("Appartement témoin - 3 pièces - Paris (données fictives)")
    setCriteresRecherche(createTestCriteres())
    setGaranties(createTestGaranties())
    setVeutRemplirRecherche("oui")
    setEditingField(null)
    setShowValidationErrors(false)
    setErrorMessage(null)
    toast.success(`Champs préremplis avec ${nombreLocataires} locataire${nombreLocataires > 1 ? 's' : ''} de test.`)
  }

  const isBienConcerneMissing = showValidationErrors && (!bienConcerne || bienConcerne.trim() === "")

  return (
    <div className="min-h-screen bg-slate-50">
      <LoadingOverlay
        show={isSubmitting || isSuccess}
        isSuccess={isSuccess}
        onClose={() => router.push('/')}
      />

      {/* Message d'erreur */}
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  <FadeInText text="Fiche de renseignements locataire" />
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Hero contextualisé */}
        <Reveal>
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white">
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-32 -bottom-28 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl" />
          <CardHeader className="relative space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-sm font-medium w-fit">
              <Sparkles className="h-4 w-4" />
              Parcours guidé
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                <FadeInText text="Complétez votre dossier locataire en quelques étapes" />
              </CardTitle>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAutofill}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Sparkles className="h-4 w-4" />
                Remplir en test
              </Button>
            </div>
            <p className="text-sm sm:text-base text-white/80">
              Renseignez vos informations de locataire dans un formulaire guidé. Temps estimé : 5 à 10 minutes – vous recevrez un récapitulatif par email.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Info className="h-4 w-4" />
              <span>Données fictives générées automatiquement pour vérifier l’envoi des PDF.</span>
            </div>
          </CardHeader>
          <CardContent className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {[
              { icon: <Home className="h-4 w-4" />, label: "Bien concerné & foyer", step: 1 },
              { icon: <Users className="h-4 w-4" />, label: "Locataires", step: 2 },
              { icon: <Shield className="h-4 w-4" />, label: "Garants", step: 3 },
              { icon: <CheckCircle className="h-4 w-4" />, label: "Vérification & envoi", step: 4 }
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

        {/* Bien concerné */}
        <Reveal delay={60}>
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Bien concerné</CardTitle>
                <p className="text-sm text-slate-600">Indiquez le bien et le foyer concernés par votre demande de location.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2" id="field-bienConcerne">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Description du bien
                  </label>
                  {isBienConcerneMissing && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                </div>
                <textarea
                  value={bienConcerne}
                  onChange={(e) => setBienConcerne(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white"
                  placeholder="Ex: Appartement T3 - 75m² - Paris 11ème"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Nombre d'enfants dans le foyer
                </label>
                <input
                  type="number"
                  value={nombreEnfantsFoyer}
                  onChange={(e) => setNombreEnfantsFoyer(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        </Reveal>

        {/* Locataires */}
        <div className="space-y-4">
          <Reveal delay={80}>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 sm:px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Locataires ({locataires.length})</CardTitle>
                <p className="text-sm text-slate-600">Identité, situation et revenus des personnes qui vivront dans le logement.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Badges \"Rempli\" pour suivre l'avancement</span>
              </div>
              <Button
                onClick={addLocataire}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="h-4 w-4" />
                Ajouter un locataire
              </Button>
            </div>
          </div>
          </Reveal>

          <div className="space-y-4">
            {locataires.map((locataire, index) => {
              const handlers = createLocataireFieldHandlers(index)
              return (
                <Reveal key={`locataire-${index}`} delay={index * 50}>
                <LocataireCard
                  locataire={locataire}
                  locataireIndex={index}
                  editingField={editingField}
                  onFieldChange={handlers.onChange}
                  onFieldEdit={handlers.onEdit}
                  onFieldBlur={handlers.onBlur}
                  onRemove={() => removeLocataire(index)}
                  canRemove={locataires.length > 1}
                  showValidationErrors={showValidationErrors}
                />
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Critères de recherche (facultatif) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 sm:px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Critères de recherche</CardTitle>
                <p className="text-sm text-slate-600">Facultatif – pour mieux cibler vos futures locations et/ou achats.</p>
              </div>
              <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50">Facultatif</Badge>
            </div>
            <div className="flex items-center flex-wrap gap-3">
              <span className="text-sm font-medium text-slate-800">Souhaitez-vous renseigner vos critères de recherche ?</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={veutRemplirRecherche === "non" ? "default" : "outline"}
                  className={veutRemplirRecherche === "non" ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-slate-200"}
                  onClick={() => setVeutRemplirRecherche("non")}
                >
                  Non pour le moment
                </Button>
                <Button
                  type="button"
                  variant={veutRemplirRecherche === "oui" ? "default" : "outline"}
                  className={veutRemplirRecherche === "oui" ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-slate-200"}
                  onClick={() => setVeutRemplirRecherche("oui")}
                >
                  Oui
                </Button>
              </div>
            </div>
          </div>
          {veutRemplirRecherche === "oui" && (
            <CriteresRechercheCard
              criteres={criteresRecherche}
              editingField={editingField}
              onFieldChange={(field, value) => handleFieldChange(`criteres_${field}`, value)}
              onFieldEdit={(field) => handleFieldEdit(`criteres_${field}`)}
              onFieldBlur={handleFieldBlur}
              showValidationErrors={false}
            />
          )}
        </div>

        {/* Garanties (facultatif) */}
        <GarantiesCard
          garanties={garanties}
          editingField={editingField}
          onFieldChange={(field, value) => handleFieldChange(`garanties_${field}`, value)}
          onFieldEdit={(field) => handleFieldEdit(`garanties_${field}`)}
          onFieldBlur={handleFieldBlur}
          showValidationErrors={false}
        />

        {/* Boutons d'action */}
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
                  Merci de remplir les champs obligatoires : Bien concerne, Identite et Type de contrat.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Button
                onClick={addLocataire}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="h-5 w-5" />
                Ajouter un locataire
              </Button>
              <Button
                onClick={handleSubmit}
                size="lg"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <Send className="h-5 w-5" />
                {isSubmitting ? "Envoi en cours..." : "Envoyer le formulaire"}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Info className="h-4 w-4 text-slate-500" />
              <span>Les données sont sécurisées et utilisées uniquement pour votre dossier locataire.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
