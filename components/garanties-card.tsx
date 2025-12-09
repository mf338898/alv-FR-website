"use client"

import { FormSection } from "./form-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import type { Garanties } from "@/lib/types"

interface GarantiesCardProps {
  garanties: Garanties
  editingField: string | null
  onFieldChange: (field: string, value: string) => void
  onFieldEdit: (field: string) => void
  onFieldBlur: () => void
  showValidationErrors?: boolean
}

export function GarantiesCard({
  garanties,
  editingField,
  onFieldChange,
  onFieldEdit,
  onFieldBlur,
  showValidationErrors = false
}: GarantiesCardProps) {
  // Facultatif : pas de validation bloquante
  const isFieldMissing = () => false

  // Champs pour les garanties
  const garantiesFields = [
    { key: "garantFamilial", label: "Garant familial", type: "select" as const, options: ["oui", "non"] },
    { key: "garantieVisale", label: "Garantie Visale", type: "select" as const, options: ["oui", "non"] },
    { key: "precisionGarant", label: "Précisions sur les garants", type: "text" as const }
  ]

  return (
    <Card className="border-0 shadow-lg bg-white/90">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Garanties</CardTitle>
              <p className="text-sm text-slate-600">Garants familiaux, Visale et précisions</p>
            </div>
          </div>
          <span className="text-xs text-slate-500">Facultatif</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <FormSection
          title="Informations garanties"
          fields={garantiesFields}
          data={garanties}
          editingField={editingField}
          onFieldChange={onFieldChange}
          onFieldEdit={onFieldEdit}
          onFieldBlur={onFieldBlur}
          isFieldMissing={isFieldMissing}
          fieldPrefix="garanties_"
        />
      </CardContent>
    </Card>
  )
}
