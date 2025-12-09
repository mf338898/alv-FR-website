import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type AddressSuggestion = {
  label: string
  value: string
  source: "france" | "international"
}

type UseAddressAutocompleteOptions = {
  limit?: number
}

function useAddressAutocomplete(query: string, { limit = 8 }: UseAddressAutocompleteOptions = {}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastQueryRef = useRef<string>("")

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      setLoading(false)
      setError(null)
      lastQueryRef.current = ""
      return
    }

    const trimmedQuery = query.trim()
    if (trimmedQuery === lastQueryRef.current) {
      return
    }
    lastQueryRef.current = trimmedQuery

    setLoading(true)
    setError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const allSuggestions: AddressSuggestion[] = []

      // 1. Essayer d'abord l'API française
      try {
        const frUrl = new URL("https://api-adresse.data.gouv.fr/search/")
        frUrl.searchParams.set("q", trimmedQuery)
        frUrl.searchParams.set("limit", String(limit))
        frUrl.searchParams.set("autocomplete", "1")

        const frRes = await fetch(frUrl.toString(), { signal: controller.signal })
        if (!frRes.ok) throw new Error(`HTTP ${frRes.status}`)

        const frData = (await frRes.json()) as { features?: Array<{ properties?: { label?: string; city?: string; postcode?: string } }> }
        const frFeatures = Array.isArray(frData?.features) ? frData.features : []

        for (const feature of frFeatures.slice(0, limit)) {
          const props = feature?.properties || {}
          const label = props.label || ""
          if (label) {
            allSuggestions.push({
              label,
              value: label,
              source: "france",
            })
          }
        }
      } catch (e) {
        // Ignore les erreurs de l'API française, on essaiera Nominatim
        if (e instanceof Error && e.name !== "AbortError") {
          console.debug("Erreur API française:", e.message)
        }
      }

      // 2. Si pas assez de résultats français, essayer Nominatim (international)
      if (allSuggestions.length < limit && !controller.signal.aborted) {
        try {
          // Attendre un peu pour respecter le rate limit de Nominatim
          await new Promise((resolve) => setTimeout(resolve, 300))

          const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search")
          nominatimUrl.searchParams.set("q", trimmedQuery)
          nominatimUrl.searchParams.set("format", "json")
          nominatimUrl.searchParams.set("limit", String(limit - allSuggestions.length))
          nominatimUrl.searchParams.set("addressdetails", "1")

          const nominatimRes = await fetch(nominatimUrl.toString(), {
            signal: controller.signal,
            headers: {
              "User-Agent": "FR-ALV/1.0 (contact: support@example.com)", // Requis par Nominatim
            },
          })

          if (nominatimRes.ok) {
            const nominatimData = (await nominatimRes.json()) as Array<{
              display_name?: string
              address?: {
                road?: string
                house_number?: string
                postcode?: string
                city?: string
                town?: string
                village?: string
                country?: string
              }
            }>

            for (const item of nominatimData) {
              if (controller.signal.aborted) break

              const addr = item.address || {}
              const road = addr.road || ""
              const houseNumber = addr.house_number || ""
              const postcode = addr.postcode || ""
              const city = addr.city || addr.town || addr.village || ""
              const country = addr.country || ""

              // Construire le label formaté
              let label = ""
              if (houseNumber && road) {
                label = `${houseNumber} ${road}`
              } else if (road) {
                label = road
              } else {
                label = item.display_name || ""
              }

              if (postcode && city) {
                label += `, ${postcode} ${city}`
              } else if (city) {
                label += `, ${city}`
              }

              if (country && country !== "France") {
                label += `, ${country}`
              }

              if (label) {
                allSuggestions.push({
                  label,
                  value: label,
                  source: "international",
                })
              }
            }
          }
        } catch (e) {
          // Ignore les erreurs Nominatim
          if (e instanceof Error && e.name !== "AbortError") {
            console.debug("Erreur Nominatim:", e.message)
          }
        }
      }

      if (!controller.signal.aborted) {
        setSuggestions(allSuggestions.slice(0, limit))
        setLoading(false)
      }
    }, 250)

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

export function AddressAutocompleteField({ value, onChange, placeholder, className, autoFocus }: Props) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const { suggestions, loading } = useAddressAutocomplete(value)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const showDropdown = open && (loading || suggestions.length > 0)

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
    if (value && value.trim().length >= 2) {
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
        onFocus={() => value && value.trim().length >= 2 && setOpen(true)}
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
          {loading && <div className="px-3 py-2 text-xs text-slate-500">Recherche…</div>}
          {!loading &&
            suggestions.map((s, idx) => (
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
          {!loading && suggestions.length === 0 && value.trim().length >= 2 && (
            <div className="px-3 py-2 text-xs text-slate-500">
              Aucun résultat. Vous pouvez continuer à taper pour saisir manuellement.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
