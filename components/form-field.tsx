"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check } from "lucide-react"
import { DatePicker } from "@/components/date-picker"

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  onEdit: () => void
  onBlur: () => void
  isEditing: boolean
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select'
  placeholder?: string
  options?: string[]
  autoFocus?: boolean
  isMissing?: boolean
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
  isMissing = false
}: FormFieldProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onBlur()
    }
  }

  const handleBlur = () => {
    onBlur()
  }

  const displayValue = () => {
    if (value) {
      if (type === 'number' && value) {
        return `${value} €`
      }
      return value
    }
    return <span className="text-gray-400 italic">Cliquer pour {placeholder?.toLowerCase() || 'entrer'}</span>
  }

  const isFilled = value && value.trim() !== ''

  return (
    <div className={`flex border-b min-h-[40px] ${isMissing ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
      <div className={`w-2/5 sm:w-1/3 border-r px-2 sm:px-3 py-2 flex items-center text-xs sm:text-sm font-medium ${isMissing ? 'bg-red-100 border-red-300 text-red-700' : 'bg-gray-50 border-gray-300'}`}>
        {label}
      </div>
      <div className="flex-1 px-2 sm:px-3 py-2 flex items-center justify-between">
        <div className="flex-1">
          {isEditing ? (
            <>
              {type === 'select' ? (
                <Select 
                  value={value} 
                  onValueChange={(newValue) => {
                    onChange(newValue)
                    onBlur()
                  }}
                >
                  <SelectTrigger className="h-8">
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
              ) : type === 'date' ? (
                <DatePicker
                  value={value}
                  onChange={(newValue) => {
                    onChange(newValue)
                    onBlur()
                  }}
                  placeholder={placeholder}
                  className="h-8"
                />
              ) : (
                <Input
                  type={type}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                  className="h-8"
                  autoFocus={autoFocus}
                />
              )}
            </>
          ) : (
            <div 
              className="cursor-pointer hover:bg-gray-50 transition-colors py-1"
              onClick={onEdit}
            >
              {displayValue()}
            </div>
          )}
        </div>
        
        {/* Badge vert pour les champs remplis */}
        {isFilled && !isEditing && (
          <div className="ml-2 sm:ml-3 flex items-center">
            <div className="bg-green-100 text-green-700 px-1 sm:px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span className="hidden sm:inline">Rempli</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
