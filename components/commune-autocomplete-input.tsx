import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Suggestion = {
  label: string
  value: string
}

type UseCommuneAutocompleteOptions = {
  limit?: number
}

function useCommuneAutocomplete(query: string, { limit = 8 }: UseCommuneAutocompleteOptions = {}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const url = new URL("https://geo.api.gouv.fr/communes")
      url.searchParams.set("nom", query)
      url.searchParams.set("fields", "nom,code,codesPostaux")
      url.searchParams.set("boost", "population")
      url.searchParams.set("limit", String(limit))

      fetch(url.toString(), { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = (await res.json()) as Array<{ nom: string; codesPostaux?: string[] }>
          const mapped = data
            .flatMap((c) => {
              const cps = c.codesPostaux && c.codesPostaux.length ? c.codesPostaux : [""]
              return cps.map((cp) => {
                const label = cp ? `${cp} ${c.nom}` : c.nom
                return { label, value: label }
              })
            })
            .slice(0, limit)
          setSuggestions(mapped)
          setLoading(false)
        })
        .catch((e) => {
          if (e.name === "AbortError") return
          setError(e.message || "Erreur")
          setLoading(false)
        })
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [query, limit])

  return { suggestions, loading, error }
}

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function CommuneAutocompleteInput({ value, onChange, placeholder, className, autoFocus }: Props) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const { suggestions, loading } = useCommuneAutocomplete(value)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const showDropdown = open && suggestions.length > 0

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      setOpen(true)
      return
    }
    if (!showDropdown) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex].value)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  useEffect(() => {
    const onClickOutside = (ev: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(ev.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  useEffect(() => {
    // Reopen dropdown when typing
    if (value) {
      setOpen(true)
    } else {
      setOpen(false)
      setActiveIndex(-1)
    }
  }, [value])

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => value && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-56 overflow-auto">
          {suggestions.map((s, idx) => (
            <button
              type="button"
              key={`${s.value}-${idx}`}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${
                idx === activeIndex ? "bg-slate-100" : ""
              }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s.value)}
            >
              {s.label}
            </button>
          ))}
          {loading && <div className="px-3 py-2 text-xs text-slate-500">Recherche…</div>}
          {!loading && suggestions.length === 0 && value.trim().length >= 2 && (
            <div className="px-3 py-2 text-xs text-slate-500">Aucun résultat</div>
          )}
        </div>
      )}
    </div>
  )
}
