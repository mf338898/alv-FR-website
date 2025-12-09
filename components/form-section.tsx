"use client"

import { FormField } from "./form-field"
import { cn } from "@/lib/utils"

interface FormSectionProps {
  title: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select'
    placeholder?: string
    options?: string[]
    autoComplete?: string
    communeAutocomplete?: boolean
    addressAutocomplete?: boolean
  }>
  data: Record<string, any>
  editingField: string | null
  onFieldChange: (key: string, value: string) => void
  onFieldEdit: (key: string) => void
  onFieldBlur: () => void
  isFieldMissing?: (field: string) => boolean
  fieldPrefix?: string // Nouveau prop pour le préfixe des champs
  className?: string
}

export function FormSection({
  title,
  fields,
  data,
  editingField,
  onFieldChange,
  onFieldEdit,
  onFieldBlur,
  isFieldMissing,
  fieldPrefix = "",
  className
}: FormSectionProps) {
  const toId = (value: string) => `field-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((field) => (
          <FormField
            key={field.key}
            label={field.label}
            value={data[field.key] || ""}
            onChange={(value) => onFieldChange(field.key, value)}
            onEdit={() => onFieldEdit(field.key)}
            onBlur={onFieldBlur}
            isEditing={editingField === `${fieldPrefix}${field.key}` || false}
            type={field.type}
            placeholder={field.placeholder}
            options={field.options}
            autoFocus={editingField === `${fieldPrefix}${field.key}` || false}
            isMissing={isFieldMissing?.(field.key) || false}
            autoComplete={field.autoComplete}
            fieldId={toId(`${fieldPrefix}${field.key}`)}
            communeAutocomplete={field.communeAutocomplete}
            addressAutocomplete={field.addressAutocomplete}
          />
        ))}
      </div>
    </div>
  )
}
