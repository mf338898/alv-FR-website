"use client"

import { FormSection } from "./form-section"
import type { CriteresRecherche } from "@/lib/types"

interface CriteresRechercheCardProps {
  criteres: CriteresRecherche
  editingField: string | null
  onFieldChange: (field: string, value: string) => void
  onFieldEdit: (field: string) => void
  onFieldBlur: () => void
  showValidationErrors?: boolean
}

export function CriteresRechercheCard({
  criteres,
  editingField,
  onFieldChange,
  onFieldEdit,
  onFieldBlur,
  showValidationErrors = false
}: CriteresRechercheCardProps) {
  // Fonction pour vérifier si un champ est manquant
  const isFieldMissing = (field: string): boolean => {
    if (!showValidationErrors) return false
    
    const requiredFields = ['nombreChambres', 'secteurSouhaite', 'rayonKm', 'dateEmmenagement', 'preavisADeposer', 'raisonDemenagement', 'loyerMax', 'informationsComplementaires']
    if (!requiredFields.includes(field)) return false
    
    const value = criteres[field as keyof CriteresRecherche]
    return !value || (typeof value === 'string' && value.trim() === '')
  }

  // Champs pour les critères de recherche
  const criteresFields = [
    { key: "nombreChambres", label: "Nombre de chambres souhaitées", type: "select" as const, options: ["1", "2", "3", "4", "5+"] },
    { key: "secteurSouhaite", label: "Secteur souhaité", type: "text" as const },
    { key: "rayonKm", label: "Rayon de recherche (km)", type: "text" as const },
    { key: "dateEmmenagement", label: "Date d'emménagement souhaitée", type: "date" as const },
    { key: "preavisADeposer", label: "Préavis à déposer", type: "select" as const, options: ["1 mois", "2 mois", "3 mois", "Aucun"] },
    { key: "raisonDemenagement", label: "Raison du déménagement", type: "text" as const },
    { key: "loyerMax", label: "Loyer maximum (€)", type: "number" as const, placeholder: "Montant en €" },
    { key: "informationsComplementaires", label: "Informations complémentaires", type: "text" as const }
  ]

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
      {/* En-tête de la carte */}
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900">
          Critères de recherche
        </h3>
      </div>

      {/* Section Critères */}
      <FormSection
        title="Recherche de logement"
        fields={criteresFields}
        data={criteres}
        editingField={editingField}
        onFieldChange={onFieldChange}
        onFieldEdit={onFieldEdit}
        onFieldBlur={onFieldBlur}
        isFieldMissing={isFieldMissing}
        fieldPrefix="criteres_"
      />
    </div>
  )
}
