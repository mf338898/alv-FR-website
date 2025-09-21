"use client"

import { FormSection } from "./form-section"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import type { Locataire } from "@/lib/types"

interface LocataireCardProps {
  locataire: Locataire
  locataireIndex: number
  editingField: string | null
  onFieldChange: (field: string, value: string) => void
  onFieldEdit: (field: string) => void
  onFieldBlur: () => void
  onRemove: () => void
  canRemove: boolean
}

export function LocataireCard({
  locataire,
  locataireIndex,
  editingField,
  onFieldChange,
  onFieldEdit,
  onFieldBlur,
  onRemove,
  canRemove
}: LocataireCardProps) {
  // Champs pour la section Identité
  const identiteFields = [
    { key: "civilite", label: "Civilité", type: "select" as const, options: ["Madame", "Monsieur"] },
    { key: "nom", label: "Nom", type: "text" as const },
    { key: "prenom", label: "Prénom", type: "text" as const },
    { key: "dateNaissance", label: "Date de naissance", type: "date" as const },
    { key: "lieuNaissance", label: "Lieu de naissance", type: "text" as const },
    { key: "situationConjugale", label: "Situation conjugale", type: "select" as const, options: ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf/Veuve", "Pacsé(e)"] },
    { key: "adresseActuelle", label: "Adresse actuelle", type: "text" as const },
    { key: "telephone", label: "Téléphone", type: "text" as const },
    { key: "email", label: "Email", type: "email" as const }
  ]

  // Champs pour la section Professionnel
  const professionnelFields = [
    { key: "profession", label: "Profession", type: "text" as const },
    { key: "employeurNom", label: "Employeur", type: "text" as const },
    { key: "employeurAdresse", label: "Adresse employeur", type: "text" as const },
    { key: "employeurTelephone", label: "Téléphone employeur", type: "text" as const },
    { key: "dateEmbauche", label: "Date d'embauche", type: "date" as const },
    { key: "typeContrat", label: "Type de contrat", type: "select" as const, options: ["CDI", "CDD", "Stage", "Alternance", "Freelance", "Retraité", "Chômage", "Étudiant"] },
    { key: "salaire", label: "Salaire mensuel net", type: "number" as const, placeholder: "Montant en €" }
  ]



  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
      {/* En-tête de la carte */}
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Locataire {locataireIndex + 1}
        </h3>
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
                <AlertDialogTitle>Supprimer le locataire</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer ce locataire ? Cette action est irréversible.
                  <br />
                  <strong>Locataire {locataireIndex + 1} : {locataire.prenom} {locataire.nom}</strong>
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

      {/* Section Identité */}
      <FormSection
        title="Identité"
        fields={identiteFields}
        data={locataire}
        editingField={editingField}
        onFieldChange={onFieldChange}
        onFieldEdit={onFieldEdit}
        onFieldBlur={onFieldBlur}
      />

      {/* Section Professionnel */}
      <FormSection
        title="Situation professionnelle"
        fields={professionnelFields}
        data={locataire}
        editingField={editingField}
        onFieldChange={onFieldChange}
        onFieldEdit={onFieldEdit}
        onFieldBlur={onFieldBlur}
      />


    </div>
  )
}
