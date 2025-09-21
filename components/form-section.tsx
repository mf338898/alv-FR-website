"use client"

import { FormField } from "./form-field"

interface FormSectionProps {
  title: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select'
    placeholder?: string
    options?: string[]
  }>
  data: Record<string, string>
  editingField: string | null
  onFieldChange: (key: string, value: string) => void
  onFieldEdit: (key: string) => void
  onFieldBlur: () => void
}

export function FormSection({
  title,
  fields,
  data,
  editingField,
  onFieldChange,
  onFieldEdit,
  onFieldBlur
}: FormSectionProps) {
  return (
    <div className="border-b border-gray-300">
      <div className="bg-gray-100 px-4 sm:px-6 py-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      
      {fields.map((field) => (
        <FormField
          key={field.key}
          label={field.label}
          value={data[field.key] || ""}
          onChange={(value) => onFieldChange(field.key, value)}
          onEdit={() => onFieldEdit(field.key)}
          onBlur={onFieldBlur}
          isEditing={editingField === field.key || editingField?.endsWith(`_${field.key}`)}
          type={field.type}
          placeholder={field.placeholder}
          options={field.options}
          autoFocus={editingField === field.key || editingField?.endsWith(`_${field.key}`)}
        />
      ))}
    </div>
  )
}
