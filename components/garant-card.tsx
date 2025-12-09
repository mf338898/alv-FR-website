"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormSection } from "./form-section"
import { FormField } from "./form-field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Trash2, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import type { Locataire } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

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
  { key: 'civilite', label: 'Civilité', type: 'select' as const, options: ['Madame', 'Monsieur'], autoComplete: 'honorific-prefix' },
  { key: 'nom', label: 'Nom', type: 'text' as const, placeholder: 'Entrer le nom', autoComplete: 'family-name' },
  { key: 'prenom', label: 'Prénom', type: 'text' as const, placeholder: 'Entrer le prénom', autoComplete: 'given-name' },
  { key: 'situationConjugale', label: 'Situation conjugale', type: 'select' as const, options: ['Célibataire', 'Concubin(e) / union libre', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf/Veuve'] },
  { key: 'adresseActuelle', label: 'Adresse actuelle', type: 'text' as const, placeholder: 'Entrer l\'adresse complète', autoComplete: 'street-address', addressAutocomplete: true },
  { key: 'telephone', label: 'Téléphone', type: 'tel' as const, placeholder: 'Entrer le numéro de téléphone', autoComplete: 'tel' },
  { key: 'email', label: 'Adresse mail', type: 'email' as const, placeholder: 'Entrer l\'adresse email', autoComplete: 'email' },
  { key: 'dateNaissance', label: 'Date de naissance', type: 'date' as const, autoComplete: 'bday' },
  { key: 'lieuNaissance', label: 'Lieu de naissance', type: 'text' as const, placeholder: 'Ex: 33000 Bordeaux (CP + ville)', autoComplete: 'bday-country', communeAutocomplete: true }
]

const professionalFields = [
  { key: 'profession', label: 'Profession', type: 'text' as const, placeholder: 'Entrer la profession' },
  { key: 'employeurNom', label: 'Nom de l\'employeur', type: 'text' as const, placeholder: 'Entrer le nom de l\'employeur' },
  { key: 'dateEmbauche', label: 'Date d\'embauche', type: 'date' as const },
  { key: 'typeContrat', label: 'Type de contrat', type: 'select' as const, options: ['CDI', 'CDD', 'Intérim', 'Stage', 'Alternance', 'Libéral', 'Auto-entrepreneur', 'Retraité(e)', 'Chômeur/Chômeuse'] }
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
  const revenusOptions = [
    { key: "indemnitesChomage", label: "Indemnités chômage" },
    { key: "aahAllocationsHandicap", label: "AAH / Allocations handicap" },
    { key: "rsa", label: "RSA" },
    { key: "pension", label: "Pension (retraite, pension alimentaire…)" },
    { key: "revenusAutoEntrepreneur", label: "Revenus auto-entrepreneur / indépendant" },
    { key: "aidesAuLogement", label: "Aides au logement (APL estimées si connues)" }
  ]
  const [revenusSupp, setRevenusSupp] = useState<string[]>([])

  useEffect(() => {
    const init = revenusOptions
      .filter((opt) => {
        const val = garant[opt.key as keyof Locataire]
        return typeof val === "string" && val.trim() !== ""
      })
      .map((opt) => opt.key)
    setRevenusSupp((prev) => {
      const merged = Array.from(new Set([...prev, ...init]))
      return merged
    })
  }, [garant])

  const addRevenu = () => {
    const next = revenusOptions.find((opt) => !revenusSupp.includes(opt.key))
    if (next) {
      setRevenusSupp((prev) => [...prev, next.key])
    }
  }

  const removeRevenu = (key: string) => {
    onFieldChange(key, "")
    setRevenusSupp((prev) => prev.filter((k) => k !== key))
  }

  const updateRevenuKey = (index: number, newKey: string, oldKey: string) => {
    if (revenusSupp.includes(newKey)) return
    const oldValue = garant[oldKey as keyof Locataire] as string
    onFieldChange(oldKey, "")
    onFieldChange(newKey, oldValue || "")
    setRevenusSupp((prev) => prev.map((k, i) => (i === index ? newKey : k)))
  }

  // Fonction pour vérifier si un champ est manquant
  const requiredFields = [
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

  const isFieldMissing = (field: string): boolean => {
    if (!showValidationErrors) return false
    
    if (!requiredFields.includes(field)) return false
    
    const value = garant[field as keyof Locataire]
    return !value || (typeof value === 'string' && value.trim() === '')
  }

  const isComplete = requiredFields.every((field) => {
    const value = garant[field as keyof Locataire]
    return value && (typeof value === "string" ? value.trim() !== "" : true)
  })
  return (
    <Card className="border-0 shadow-lg bg-white/90">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Garant {garantIndex + 1}</CardTitle>
              <p className="text-sm text-slate-600">Identité, situation et lien avec le locataire</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={isComplete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}
          >
            {isComplete ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Complet
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                À compléter
              </span>
            )}
          </Badge>
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
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
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

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Revenus mensuels</h3>
            <p className="text-xs text-slate-600 mt-1">Indiquez uniquement les revenus qui vous concernent.</p>
          </div>

          <FormField
            label="Salaire net"
            value={garant.salaireNet || ""}
            onChange={(val) => onFieldChange("salaireNet", val)}
            onEdit={() => onFieldEdit(`garant_${garantIndex}_salaireNet`)}
            onBlur={onFieldBlur}
            isEditing={editingField === `garant_${garantIndex}_salaireNet`}
            type="number"
            placeholder="Montant en €"
            isMissing={isFieldMissing("salaireNet")}
            fieldId={`field-garant_${garantIndex}_salaireNet`}
          />

          <div className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-0 text-purple-700 hover:text-purple-800 hover:bg-purple-50"
              onClick={addRevenu}
              disabled={revenusSupp.length === revenusOptions.length}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un autre type de revenu
            </Button>

            <div className="space-y-3">
              {revenusSupp.map((key, index) => {
                const amount = (garant[key as keyof Locataire] as string) || ""
                return (
                  <div key={`${key}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <Select
                      value={key}
                      onValueChange={(newKey) => updateRevenuKey(index, newKey, key)}
                    >
                      <SelectTrigger className="sm:w-64">
                        <SelectValue placeholder="Type de revenu" />
                      </SelectTrigger>
                      <SelectContent>
                        {revenusSupp.length < revenusOptions.length &&
                          revenusOptions
                            .filter((opt) => !revenusSupp.includes(opt.key) || opt.key === key)
                            .map((opt) => (
                              <SelectItem key={opt.key} value={opt.key}>
                                {opt.label}
                              </SelectItem>
                            ))}
                        {revenusSupp.length === revenusOptions.length &&
                          revenusOptions.map((opt) => (
                            <SelectItem key={opt.key} value={opt.key}>
                              {opt.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => onFieldChange(key, e.target.value)}
                      placeholder="Montant en €"
                      className="flex-1"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => removeRevenu(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

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
      </CardContent>
    </Card>
  )
}
