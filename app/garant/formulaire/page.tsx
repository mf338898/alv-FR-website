"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Plus, 
  FileText, 
  ArrowLeft,
  Send,
  CheckCircle
} from "lucide-react"
import type { Locataire, GarantContact } from "@/lib/types"
import { LoadingOverlay } from "@/components/loading-overlay"
import { GarantCard } from "@/components/garant-card"
import ErrorMessage from "@/components/error-message"

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

  // Fonction pour vérifier si le formulaire est complet
  const isFormComplete = (): boolean => {
    for (const garant of garants) {
      if (!garant.nom?.trim() || !garant.prenom?.trim() || !garant.civilite?.trim() || 
          !garant.situationConjugale?.trim() || !garant.adresseActuelle?.trim() || 
          !garant.telephone?.trim() || !garant.email?.trim() || 
          !garant.dateNaissance?.trim() || !garant.lieuNaissance?.trim() || 
          !garant.profession?.trim() || !garant.employeurNom?.trim() || 
          !garant.dateEmbauche?.trim() || !garant.typeContrat?.trim() || !garant.salaire?.trim() ||
          !garant.locataireConcerneNom?.trim() || !garant.locataireConcernePrenom?.trim() || 
          !garant.locataireConcerneEmail?.trim() || !garant.locataireConcerneTelephone?.trim()) {
        return false
      }
      }
      return true
    }
    
  // Fonction pour valider le formulaire
  const validateForm = (): boolean => {
    if (!isFormComplete()) {
      toast.error("Veuillez remplir tous les champs obligatoires")
        return false
      }
      return true
    }
    
  // Fonction pour soumettre le formulaire
  const handleSubmit = async () => {
    if (!isFormComplete()) {
      setShowValidationErrors(true)
      toast.error("Veuillez remplir tous les champs obligatoires")
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

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        // Ne plus rediriger vers la page de confirmation
      } else {
        setErrorMessage("Une erreur s'est produite lors de l'envoi. Veuillez réessayer.")
      }
    } catch (error) {
      console.error(error)
      setErrorMessage("Une erreur s'est produite lors de l'envoi. Veuillez réessayer.")
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
      
      {/* Message d'erreur */}
      {errorMessage && (
        <ErrorMessage 
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      
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
      
          {/* Ligne 2: Titre et bouton ajouter */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                FICHE DE RENSEIGNEMENTS GARANT(S)
              </h1>
            </div>
                      <Button
                        onClick={addGarant}
              variant="outline"
                        size="sm"
              className="flex items-center gap-2 flex-shrink-0"
                      >
                        <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter un garant</span>
              <span className="sm:hidden">Ajouter</span>
                      </Button>
                        </div>
                      </div>
                    </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Formulaire pour chaque garant */}
        {garants.map((garant, garantIndex) => {
          const handlers = createGarantFieldHandlers(garantIndex)
                      return (
            <GarantCard
              key={`garant-${garantIndex}`}
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
          )
        })}

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

          {/* Bouton ajouter un garant */}
            <Button
            onClick={addGarant}
              variant="outline"
            size="lg"
            className="flex items-center gap-2"
            >
            <Plus className="h-5 w-5" />
            Ajouter un garant
            </Button>
          
          {/* Bouton de soumission */}
            <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            {isSubmitting ? "Envoi en cours..." : "Envoyer le formulaire"}
            </Button>
        </div>
                          </div>
                        </div>
  )
}
