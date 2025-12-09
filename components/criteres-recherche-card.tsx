"use client"

import { FormSection } from "./form-section"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Home, Landmark } from "lucide-react"
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
  // Facultatif : pas de validation bloquante
  const isFieldMissing = () => false

  const montreAchat = useMemo(
    () => criteres.rechercheType === "achat" || criteres.rechercheType === "les_deux",
    [criteres.rechercheType]
  )

  // Champs pour les critères de recherche
  const criteresFields = [
    { key: "nombreChambres", label: "Nombre de chambres souhaitées", type: "select" as const, options: ["1", "2", "3", "4", "5+"] },
    { key: "secteurSouhaite", label: "Secteur souhaité", type: "text" as const, placeholder: "Ex: 33000 Bordeaux (CP + ville)", communeAutocomplete: true },
    { key: "rayonKm", label: "Rayon de recherche (km)", type: "text" as const },
    { key: "dateEmmenagement", label: "Date d'emménagement souhaitée", type: "date" as const },
    { key: "preavisADeposer", label: "Préavis à déposer", type: "select" as const, options: ["1 mois", "2 mois", "3 mois", "Aucun"] },
    { key: "raisonDemenagement", label: "Raison du déménagement", type: "text" as const },
    { key: "loyerMax", label: "Loyer maximum (€)", type: "number" as const, placeholder: "Budget max (location)" },
    { key: "informationsComplementaires", label: "Informations complémentaires", type: "text" as const }
  ]

  const achatFields = [
    { key: "typeBienAchat", label: "Type de bien recherché (achat)", type: "select" as const, options: ["Maison", "Appartement", "Parking / box", "Terrain", "Local commercial"] },
    { key: "budgetAchat", label: "Budget max (achat)", type: "number" as const, placeholder: "Montant en €" },
    { key: "financementAchat", label: "Financement / apport (achat)", type: "text" as const, placeholder: "Prêt, apport, mix..." },
    { key: "banqueConsultee", label: "Avez-vous vu votre banque ?", type: "select" as const, options: ["oui", "non"] },
    { key: "informationsComplementaires", label: "Informations complémentaires", type: "text" as const }
  ]

  return (
    <Card className="border-0 shadow-lg bg-white/90">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Critères de recherche</CardTitle>
              <p className="text-sm text-slate-600">Facultatif – pour mieux cibler vos futures locations et/ou achats.</p>
            </div>
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50">Facultatif</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-800">Vous recherchez :</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "location", label: "Location", icon: <Home className="h-4 w-4" /> },
              { value: "achat", label: "Achat", icon: <Landmark className="h-4 w-4" /> },
              { value: "les_deux", label: "Les deux", icon: <FileText className="h-4 w-4" /> }
            ].map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={criteres.rechercheType === option.value ? "default" : "outline"}
                className={criteres.rechercheType === option.value ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-slate-200"}
                onClick={() => onFieldChange("rechercheType", option.value)}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

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

        {montreAchat && (
          <FormSection
            title="Précisions achat"
            fields={achatFields}
            data={criteres}
            editingField={editingField}
            onFieldChange={onFieldChange}
            onFieldEdit={onFieldEdit}
            onFieldBlur={onFieldBlur}
            isFieldMissing={isFieldMissing}
            fieldPrefix="criteres_"
          />
        )}
      </CardContent>
    </Card>
  )
}
