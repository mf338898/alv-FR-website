"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  FileText, 
  ArrowLeft,
  Send,
  Users,
  Home,
  Shield,
  CheckCircle
} from "lucide-react"
import type { AppFormData, Locataire, CriteresRecherche, Garanties } from "@/lib/types"
import { LoadingOverlay } from "@/components/loading-overlay"
import { LocataireCard } from "@/components/locataire-card"
import { CriteresRechercheCard } from "@/components/criteres-recherche-card"
import { GarantiesCard } from "@/components/garanties-card"

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
  salaire: "",
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
})

// Créer des critères de recherche vides
const createEmptyCriteres = (): CriteresRecherche => ({
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

// Créer le 1er locataire prérempli pour les tests
const createTestLocataire1 = (): Locataire => ({
  nom: "Dubois",
  prenom: "Claire",
  civilite: "Madame",
  situationConjugale: "Marié(e)",
  adresseActuelle: "15 Rue des Lilas, 75012 Paris",
  telephone: "0123456789",
  email: "claire.dubois@example.com",
  dateNaissance: "1990-04-15",
  lieuNaissance: "Paris",
  situationActuelle: "Locataire",
  preavisADeposer: "2 mois",
  dureePreavise: "",
  dureePreaviseAutre: "",
  hebergeParQui: "",
  profession: "Graphiste",
  etablissementFormation: "",
  employeurNom: "Studio Créatif Paris",
  employeurAdresse: "28 Avenue de la République, 75011 Paris",
  employeurTelephone: "0145678901",
  dateEmbauche: "2021-06-01",
  typeContrat: "CDI",
  salaire: "3200",
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
})

// Créer le 2ème locataire prérempli pour les tests
const createTestLocataire2 = (): Locataire => ({
  nom: "Dubois",
  prenom: "Marc",
  civilite: "Monsieur",
  situationConjugale: "Marié(e)",
  adresseActuelle: "15 Rue des Lilas, 75012 Paris",
  telephone: "0123456790",
  email: "marc.dubois@example.com",
  dateNaissance: "1988-09-22",
  lieuNaissance: "Lyon",
  situationActuelle: "Locataire",
  preavisADeposer: "2 mois",
  dureePreavise: "",
  dureePreaviseAutre: "",
  hebergeParQui: "",
  profession: "Développeur",
  etablissementFormation: "",
  employeurNom: "TechStart SAS",
  employeurAdresse: "42 Boulevard Haussmann, 75009 Paris",
  employeurTelephone: "0145678902",
  dateEmbauche: "2020-03-15",
  typeContrat: "CDI",
  salaire: "4500",
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
})

// Créer des critères de recherche préremplis
const createTestCriteres = (): CriteresRecherche => ({
  nombreChambres: "3",
  secteurSouhaite: "Paris 11ème, 12ème ou 20ème",
  rayonKm: "5",
  dateEmmenagement: "2025-02-01",
  preavisADeposer: "2 mois",
  raisonDemenagement: "Besoin de plus d'espace pour la famille",
  informationsComplementaires: "Recherche un logement proche des transports en commun",
  loyerMax: "1800",
})

// Créer des garanties préremplies
const createTestGaranties = (): Garanties => ({
  garantFamilial: "oui",
  garantieVisale: "non",
  precisionGarant: "Parents de Claire peuvent se porter garants",
  garants: [],
})

export default function LocataireFormPage() {
  const router = useRouter()
  const [locataires, setLocataires] = useState<Locataire[]>([
    createTestLocataire1(),
    createTestLocataire2()
  ])
  const [nombreEnfantsFoyer, setNombreEnfantsFoyer] = useState<number>(1)
  const [criteresRecherche, setCriteresRecherche] = useState<CriteresRecherche>(createTestCriteres())
  const [garanties, setGaranties] = useState<Garanties>(createTestGaranties())
  const [bienConcerne, setBienConcerne] = useState<string>("Appartement T3 - 75m² - Paris 11ème")
  const [veutRemplirRecherche, setVeutRemplirRecherche] = useState<string>("oui")
  
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Fonction pour vérifier si le formulaire est complet
  const isFormComplete = () => {
    // Vérifier que tous les locataires ont les champs obligatoires remplis
    const requiredFields: (keyof Locataire)[] = [
      'nom', 'prenom', 'civilite', 'situationConjugale', 'adresseActuelle',
      'telephone', 'email', 'dateNaissance', 'lieuNaissance', 'profession',
      'employeurNom', 'dateEmbauche', 'typeContrat', 'salaire'
    ]

    const locatairesComplete = locataires.every(locataire => 
      requiredFields.every(field => 
        locataire[field] && locataire[field]!.trim() !== ''
      )
    )

    // Vérifier les critères de recherche si demandés
    const criteresComplete = veutRemplirRecherche === "non" || (
      criteresRecherche.nombreChambres && 
      criteresRecherche.secteurSouhaite && 
      criteresRecherche.dateEmmenagement
    )

    // Vérifier les garanties
    const garantiesComplete = garanties.garantFamilial && garanties.precisionGarant

    return locatairesComplete && criteresComplete && garantiesComplete && bienConcerne
  }

  const handleFieldChange = (field: string, value: string) => {
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
  }

  const handleFieldEdit = (field: string) => {
    setEditingField(field)
  }

  const handleFieldBlur = () => {
    setEditingField(null)
  }

  const addLocataire = () => {
    setLocataires(prev => [...prev, createEmptyLocataire()])
  }

  const removeLocataire = (index: number) => {
    if (locataires.length > 1) {
      setLocataires(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const formData: AppFormData = {
        bienConcerne,
        locataires,
        nombreEnfantsFoyer,
        criteresRecherche,
        garanties,
        veutRemplirRecherche: "oui",
        dossierFacileLink: ""
      }

      const response = await fetch('/api/generer-pdf-locataire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        // Ne plus rediriger vers la page de confirmation
      } else {
        toast.error("Erreur lors de l'envoi du formulaire")
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error("Erreur lors de l'envoi du formulaire")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingOverlay 
        show={isSubmitting || isSuccess} 
        isSuccess={isSuccess}
        onClose={() => router.push('/')}
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 pt-safe">
        <div className="max-w-6xl mx-auto">
          {/* Ligne 1: Bouton retour */}
          <div className="mb-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push('/')}
              className="flex items-center gap-3 h-14 px-6 text-base"
            >
              <ArrowLeft className="h-6 w-6" />
              Retour
            </Button>
          </div>
          
          {/* Ligne 2: Titre */}
          <div className="flex items-start gap-2 sm:gap-3">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
              Fiche de renseignements locataire
            </h1>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Bien concerné */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Bien concerné
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du bien
                </label>
                <textarea
                  value={bienConcerne}
                  onChange={(e) => setBienConcerne(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Ex: Appartement T3 - 75m² - Paris 11ème"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'enfants dans le foyer
                </label>
                <input
                  type="number"
                  value={nombreEnfantsFoyer}
                  onChange={(e) => setNombreEnfantsFoyer(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Locataires */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Locataires ({locataires.length})
              </h2>
            </div>
            <Button
              onClick={addLocataire}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un locataire
            </Button>
          </div>

          {locataires.map((locataire, index) => (
            <LocataireCard
              key={index}
              locataire={locataire}
              locataireIndex={index}
              editingField={editingField}
              onFieldChange={(field, value) => handleFieldChange(`locataire_${index}_${field}`, value)}
              onFieldEdit={(field) => handleFieldEdit(`locataire_${index}_${field}`)}
              onFieldBlur={handleFieldBlur}
              onRemove={() => removeLocataire(index)}
              canRemove={locataires.length > 1}
            />
          ))}
        </div>

        {/* Critères de recherche */}
        <CriteresRechercheCard
          criteres={criteresRecherche}
          editingField={editingField}
          onFieldChange={(field, value) => handleFieldChange(`criteres_${field}`, value)}
          onFieldEdit={(field) => handleFieldEdit(`criteres_${field}`)}
          onFieldBlur={handleFieldBlur}
        />

        {/* Garanties */}
        <GarantiesCard
          garanties={garanties}
          editingField={editingField}
          onFieldChange={(field, value) => handleFieldChange(`garanties_${field}`, value)}
          onFieldEdit={(field) => handleFieldEdit(`garanties_${field}`)}
          onFieldBlur={handleFieldBlur}
        />

        {/* Boutons d'action */}
        <div className="flex flex-col items-center gap-4 pt-6">
          {/* Indicateur de formulaire complet */}
          {isFormComplete() && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Formulaire complet - Prêt à envoyer !
              </span>
            </div>
          )}
          
          {/* Bouton ajouter un locataire */}
          <Button
            onClick={addLocataire}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter un locataire
          </Button>
          
          {/* Bouton de soumission */}
          <Button
            onClick={handleSubmit}
            size="lg"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            <Send className="h-5 w-5" />
            {isSubmitting ? "Envoi en cours..." : "Envoyer le formulaire"}
          </Button>
        </div>
      </div>
    </div>
  )
}
