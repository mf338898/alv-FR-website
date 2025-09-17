"use client"

import { FormSection } from "./form-section"
import type { Garanties } from "@/lib/types"

interface GarantiesCardProps {
  garanties: Garanties
  editingField: string | null
  onFieldChange: (field: string, value: string) => void
  onFieldEdit: (field: string) => void
  onFieldBlur: () => void
}

export function GarantiesCard({
  garanties,
  editingField,
  onFieldChange,
  onFieldEdit,
  onFieldBlur
}: GarantiesCardProps) {
  // Champs pour les garanties
  const garantiesFields = [
    { key: "garantFamilial", label: "Garant familial", type: "select" as const, options: ["oui", "non"] },
    { key: "garantieVisale", label: "Garantie Visale", type: "select" as const, options: ["oui", "non"] },
    { key: "precisionGarant", label: "Précisions sur les garants", type: "text" as const }
  ]

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
      {/* En-tête de la carte */}
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900">
          Garanties
        </h3>
      </div>

      {/* Section Garanties */}
      <FormSection
        title="Informations garanties"
        fields={garantiesFields}
        data={garanties}
        editingField={editingField}
        onFieldChange={onFieldChange}
        onFieldEdit={onFieldEdit}
        onFieldBlur={onFieldBlur}
      />
    </div>
  )
}
