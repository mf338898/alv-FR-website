"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  className
}: DatePickerProps) {
  const currentYear = new Date().getFullYear()
  
  const [day, setDay] = React.useState<string>("")
  const [month, setMonth] = React.useState<string>("")
  const [year, setYear] = React.useState<string>("")

  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setDay(date.getDate().toString().padStart(2, '0'))
        setMonth((date.getMonth() + 1).toString().padStart(2, '0'))
        setYear(date.getFullYear().toString())
      }
    }
  }, [value])

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const months = [
    { value: "01", label: "Janvier" }, { value: "02", label: "Février" }, { value: "03", label: "Mars" },
    { value: "04", label: "Avril" }, { value: "05", label: "Mai" }, { value: "06", label: "Juin" },
    { value: "07", label: "Juillet" }, { value: "08", label: "Août" }, { value: "09", label: "Septembre" },
    { value: "10", label: "Octobre" }, { value: "11", label: "Novembre" }, { value: "12", label: "Décembre" }
  ]
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => (currentYear - i).toString())

  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    if (newDay && newMonth && newYear) {
      const dateString = `${newYear}-${newMonth}-${newDay}`
      onChange(dateString)
    }
  }

  const handleDayChange = (newDay: string) => {
    setDay(newDay)
    updateDate(newDay, month, year)
  }

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth)
    updateDate(day, newMonth, year)
  }

  const handleYearChange = (newYear: string) => {
    setYear(newYear)
    updateDate(day, month, newYear)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        
        <Select value={day} onValueChange={handleDayChange}>
          <SelectTrigger className={cn("h-8 w-16", className)}>
            <SelectValue placeholder="JJ" />
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger className={cn("h-8 w-20", className)}>
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={handleYearChange}>
          <SelectTrigger className={cn("h-8 w-20", className)}>
            <SelectValue placeholder="AAAA" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}