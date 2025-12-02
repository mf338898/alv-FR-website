"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormSection } from "./form-section"
import { User, Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import type { Locataire } from "@/lib/types"

interface GarantCardProps {
  garant: Locataire
  garantIndex: number
  editingField: string | null
  onFieldChange: (field: string, value: string) => void
  onFieldEdit: (field: string) => void
  onFieldBlur: () => void
  onRemove: () => void
  canRemove: boolean
  showValidationErrors?: boolean
}

// Configuration des champs par section
const personalFields = [
  { key: 'civilite', label: 'Civilité', type: 'select' as const, options: ['Madame', 'Monsieur'] },
  { key: 'nom', label: 'Nom', type: 'text' as const, placeholder: 'Entrer le nom' },
  { key: 'prenom', label: 'Prénom', type: 'text' as const, placeholder: 'Entrer le prénom' },
  { key: 'situationConjugale', label: 'Situation conjugale', type: 'select' as const, options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve', 'Pacsé(e)'] },
  { key: 'adresseActuelle', label: 'Adresse actuelle', type: 'text' as const, placeholder: 'Entrer l\'adresse complète' },
  { key: 'telephone', label: 'Téléphone', type: 'tel' as const, placeholder: 'Entrer le numéro de téléphone' },
  { key: 'email', label: 'Adresse mail', type: 'email' as const, placeholder: 'Entrer l\'adresse email' },
  { key: 'dateNaissance', label: 'Date de naissance', type: 'date' as const },
  { key: 'lieuNaissance', label: 'Lieu de naissance', type: 'text' as const, placeholder: 'Entrer le lieu de naissance' }
]

const professionalFields = [
  { key: 'profession', label: 'Profession', type: 'text' as const, placeholder: 'Entrer la profession' },
  { key: 'employeurNom', label: 'Nom de l\'employeur', type: 'text' as const, placeholder: 'Entrer le nom de l\'employeur' },
  { key: 'dateEmbauche', label: 'Date d\'embauche', type: 'date' as const },
  { key: 'typeContrat', label: 'Type de contrat', type: 'select' as const, options: ['CDI', 'CDD', 'Intérim', 'Stage', 'Alternance', 'Libéral', 'Auto-entrepreneur', 'Retraité(e)', 'Chômeur/Chômeuse'] }
]

const resourcesFields = [
  { key: 'salaire', label: 'Salaires', type: 'number' as const, placeholder: 'Entrer le montant en €' }
]

const locataireConcerneFields = [
  { key: 'locataireConcerneNom', label: 'Nom', type: 'text' as const, placeholder: 'Nom du locataire' },
  { key: 'locataireConcernePrenom', label: 'Prénom', type: 'text' as const, placeholder: 'Prénom du locataire' },
  { key: 'locataireConcerneEmail', label: 'Email', type: 'email' as const, placeholder: 'Email du locataire' },
  { key: 'locataireConcerneTelephone', label: 'Téléphone', type: 'text' as const, placeholder: 'Téléphone du locataire' }
]

const complementaryFields = [
  { key: 'informationsComplementaires', label: 'Informations complémentaires', type: 'text' as const, placeholder: 'Informations supplémentaires (facultatif)' }
]

export function GarantCard({
  garant,
  garantIndex,
  editingField,
  onFieldChange,
  onFieldEdit,
  onFieldBlur,
  onRemove,
  canRemove,
  showValidationErrors = false
}: GarantCardProps) {
  // Fonction pour vérifier si un champ est manquant
  const isFieldMissing = (field: string): boolean => {
    if (!showValidationErrors) return false
    
    const requiredFields = [
      'nom', 'prenom', 'civilite', 'situationConjugale', 'adresseActuelle', 'telephone', 'email', 
      'dateNaissance', 'lieuNaissance', 'profession', 'employeurNom', 'dateEmbauche', 'typeContrat', 'salaire',
      'locataireConcerneNom', 'locataireConcernePrenom', 'locataireConcerneEmail', 'locataireConcerneTelephone'
    ]
    if (!requiredFields.includes(field)) return false
    
    const value = garant[field as keyof Locataire]
    return !value || (typeof value === 'string' && value.trim() === '')
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* En-tête du garant */}
        <div className="bg-blue-50 border-b border-gray-300 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">
              Garant {garantIndex + 1}
            </h2>
          </div>
          {canRemove && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le garant</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer ce garant ? Cette action est irréversible.
                    <br />
                    <strong>Garant {garantIndex + 1} : {garant.prenom} {garant.nom}</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemove}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Tableau des informations */}
        <div className="bg-white">
          <FormSection
            title="Informations personnelles"
            fields={personalFields}
            data={garant}
            editingField={editingField}
            onFieldChange={onFieldChange}
            onFieldEdit={onFieldEdit}
            onFieldBlur={onFieldBlur}
            isFieldMissing={isFieldMissing}
            fieldPrefix={`garant_${garantIndex}_`}
          />

          <FormSection
            title="Informations professionnelles"
            fields={professionalFields}
            data={garant}
            editingField={editingField}
            onFieldChange={onFieldChange}
            onFieldEdit={onFieldEdit}
            onFieldBlur={onFieldBlur}
            isFieldMissing={isFieldMissing}
            fieldPrefix={`garant_${garantIndex}_`}
          />

          <FormSection
            title="Ressources Mensuelles :"
            fields={resourcesFields}
            data={garant}
            editingField={editingField}
            onFieldChange={onFieldChange}
            onFieldEdit={onFieldEdit}
            onFieldBlur={onFieldBlur}
            isFieldMissing={isFieldMissing}
            fieldPrefix={`garant_${garantIndex}_`}
          />

          <FormSection
            title="Locataire concerné"
            fields={locataireConcerneFields}
            data={garant}
            editingField={editingField}
            onFieldChange={onFieldChange}
            onFieldEdit={onFieldEdit}
            onFieldBlur={onFieldBlur}
            isFieldMissing={isFieldMissing}
            fieldPrefix={`garant_${garantIndex}_`}
          />

          <FormSection
            title="Informations complémentaires"
            fields={complementaryFields}
            data={garant}
            editingField={editingField}
            onFieldChange={onFieldChange}
            onFieldEdit={onFieldEdit}
            onFieldBlur={onFieldBlur}
            isFieldMissing={isFieldMissing}
            fieldPrefix={`garant_${garantIndex}_`}
          />
        </div>
      </CardContent>
    </Card>
  )
}
