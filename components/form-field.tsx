"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Check } from "lucide-react"
import { DatePicker } from "@/components/date-picker"
import { cn } from "@/lib/utils"
import { CommuneAutocompleteInput } from "./commune-autocomplete-input"
import { AddressAutocompleteField } from "./address-autocomplete-field"

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  onEdit: () => void
  onBlur: () => void
  isEditing: boolean
  type: "text" | "email" | "tel" | "date" | "number" | "select"
  placeholder?: string
  options?: string[]
  autoFocus?: boolean
  isMissing?: boolean
  autoComplete?: string
  fieldId?: string
  communeAutocomplete?: boolean
  addressAutocomplete?: boolean
}

export function FormField({
  label,
  value,
  onChange,
  onEdit,
  onBlur,
  isEditing,
  type,
  placeholder,
  options = [],
  autoFocus = false,
  isMissing = false,
  autoComplete,
  fieldId,
  communeAutocomplete = false,
  addressAutocomplete = false
}: FormFieldProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onBlur()
    }
  }

  const handleBlur = () => {
    onBlur()
  }

  const handleFocus = () => {
    onEdit()
  }

  const isFilled = typeof value === "string" ? value.trim() !== "" : !!value

  const renderControl = () => {
    if (type === "select") {
      return (
        <Select
          value={value}
          onValueChange={(newValue) => {
            onChange(newValue)
            onBlur()
          }}
        >
          <SelectTrigger className="h-11" onFocus={handleFocus} onBlur={handleBlur}>
            <SelectValue placeholder={`Sélectionner ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (type === "date") {
      return (
        <div onFocusCapture={handleFocus} onBlurCapture={handleBlur}>
          <DatePicker
            value={value}
            onChange={(newValue) => {
              onChange(newValue)
            }}
            placeholder={placeholder}
            className="h-9"
          />
        </div>
      )
    }

    if (communeAutocomplete) {
      return (
        <CommuneAutocompleteInput
          value={value}
          onChange={(newVal) => onChange(newVal)}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      )
    }

    if (addressAutocomplete) {
      return (
        <AddressAutocompleteField
          value={value}
          onChange={(newVal) => onChange(newVal)}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      )
    }

    return (
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="h-11"
        autoFocus={autoFocus}
        autoComplete={autoComplete}
      />
    )
  }

  return (
    <div
      id={fieldId}
      className={cn(
        "rounded-lg border p-4 bg-white transition-all duration-200 shadow-sm",
        isMissing && "border-rose-200 bg-rose-50 shadow-none",
        isEditing && !isMissing && "border-blue-200 ring-2 ring-blue-100",
        !isMissing && !isEditing && "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-800">{label}</label>
          {isMissing && <span className="w-2 h-2 rounded-full bg-rose-500" />}
        </div>
        {isFilled && !isMissing && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Rempli
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {renderControl()}
        {isMissing && (
          <p className="text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Champ requis
          </p>
        )}
      </div>
    </div>
  )
}
