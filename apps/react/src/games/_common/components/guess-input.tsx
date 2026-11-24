import clsx from "clsx"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { FilmIcon } from "@/shared/components/film-icon"

export interface Suggestion {
  key: string
  label: string
  sublabel?: string
  /** Thumbnail URL. "" shows a placeholder; undefined hides the slot. */
  imageUrl?: string
  /** Which placeholder to show when there's no image. Defaults to "poster". */
  imageKind?: "poster" | "person"
}

const TMDB_IMG = "https://image.tmdb.org/t/p"

export function posterUrl(path: string | null | undefined): string {
  return path ? `${TMDB_IMG}/w92${path}` : ""
}

export function profileUrl(path: string | null | undefined): string {
  return path ? `${TMDB_IMG}/w185${path}` : ""
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
    </svg>
  )
}

function SuggestionThumb({ url, kind }: { url: string; kind: "poster" | "person" }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [url])
  return (
    <div className="w-8 h-12 shrink-0 rounded overflow-hidden bg-primary-50 dark:bg-primary-900 border border-primary-300 dark:border-primary-700 flex items-center justify-center text-primary-400 dark:text-primary-500">
      {url && !failed ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : kind === "person" ? (
        <PersonIcon className="w-6 h-6 mt-auto" />
      ) : (
        <FilmIcon className="w-6 h-6" />
      )}
    </div>
  )
}

interface Props {
  disabled: boolean
  guessedKeys: Set<string>
  placeholder: string
  fetchSuggestions: (query: string, signal: AbortSignal) => Promise<Suggestion[]>
  onPick: (key: string) => void
}

export function GuessInput({
  disabled,
  guessedKeys,
  placeholder,
  fetchSuggestions,
  onPick,
}: Props) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  // The search request failed (offline, server down), as opposed to no results.
  const [failed, setFailed] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const optionId = (i: number) => `${listId}-opt-${i}`
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  const trimmed = query.trim()

  useEffect(() => {
    if (!trimmed) {
      setSuggestions([])
      setLoading(false)
      setFailed(false)
      return
    }
    setLoading(true)
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = await fetchSuggestions(trimmed, controller.signal)
        if (!controller.signal.aborted) {
          setSuggestions(results.filter((s) => !guessedKeys.has(s.key)))
          setFailed(false)
          setLoading(false)
          setHighlight(0)
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSuggestions([])
          setFailed(true)
          setLoading(false)
        }
      }
    }, 220)
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
      controller.abort()
    }
  }, [trimmed, fetchSuggestions, guessedKeys])

  const visible = useMemo(() => suggestions.slice(0, 8), [suggestions])

  useEffect(() => {
    if (highlight < 0 || !dropdownRef.current) return
    const buttons = dropdownRef.current.querySelectorAll<HTMLElement>("[data-suggestion]")
    buttons[highlight]?.scrollIntoView({ block: "nearest" })
  }, [highlight, visible])

  function select(s: Suggestion) {
    onPick(s.key)
    setQuery("")
    setSuggestions([])
    setShowDropdown(false)
    setHighlight(0)
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || visible.length === 0) {
      if (e.key === "Enter" && visible.length === 1) {
        e.preventDefault()
        const item = visible[0]
        if (item) select(item)
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((p) => Math.min(p + 1, visible.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((p) => Math.max(p - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = visible[highlight] ?? visible[0]
      if (item) select(item)
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  if (disabled) return null

  const open = showDropdown && Boolean(trimmed)
  const activeId = open && visible[highlight] ? optionId(highlight) : undefined

  return (
    <div className="shrink-0 mx-3 py-2">
      <div className="relative max-w-xs mx-auto">
        <input
          ref={inputRef}
          type="search"
          name="guess-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => trimmed && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          aria-label={placeholder.replace(/(…|\.\.\.)$/, "")}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeId}
          className="w-full px-4 py-3 text-base rounded-lg border-2 border-primary-300 dark:border-primary-700 bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-primary-50 placeholder:text-primary-500 dark:placeholder:text-primary-400 outline-none focus:border-primary-500 dark:focus:border-primary-400 [&::-webkit-search-cancel-button]:appearance-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
        />
        {/* Announces result counts to screen readers as the list updates. */}
        <span className="sr-only" role="status" aria-live="polite">
          {open && !loading && visible.length > 0
            ? `${visible.length} ${visible.length === 1 ? "suggestion" : "suggestions"}. Use up and down arrows to choose.`
            : ""}
        </span>
        {open && (
          <div
            ref={dropdownRef}
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            className="absolute bottom-full left-0 right-0 max-h-56 overflow-y-auto bg-primary-100 dark:bg-primary-800 border border-primary-300 dark:border-primary-700 rounded-lg mb-1 shadow-xl z-30"
          >
            {loading && visible.length === 0 && (
              <div className="px-3 py-2 text-xs text-primary-500 dark:text-primary-300">
                Searching…
              </div>
            )}
            {!loading && visible.length === 0 && (
              <div
                role="status"
                className={clsx(
                  "px-3 py-2 text-xs",
                  failed
                    ? "text-danger-600 dark:text-danger-400"
                    : "text-primary-500 dark:text-primary-300",
                )}
              >
                {failed
                  ? "Couldn't reach the movie search. Check your connection and try again."
                  : "No matches"}
              </div>
            )}
            {visible.map((s, i) => (
              <button
                key={s.key}
                id={optionId(i)}
                type="button"
                role="option"
                aria-selected={i === highlight}
                tabIndex={-1}
                data-suggestion
                className={clsx(
                  "flex items-center gap-2 w-full px-3 py-2 text-left cursor-pointer transition-colors",
                  i === highlight
                    ? "bg-primary-200 dark:bg-primary-700 text-primary-900 dark:text-primary-50"
                    : "text-primary-800 dark:text-primary-100 hover:bg-primary-200 dark:hover:bg-primary-700",
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(s)
                }}
                onMouseEnter={() => setHighlight(i)}
              >
                {s.imageUrl !== undefined && (
                  <SuggestionThumb url={s.imageUrl} kind={s.imageKind ?? "poster"} />
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm truncate">{s.label}</span>
                  {s.sublabel && (
                    <span className="text-[11px] text-primary-600 dark:text-primary-300 truncate">
                      {s.sublabel}
                    </span>
                  )}
                </div>
                {i === highlight && (
                  <span
                    aria-hidden="true"
                    className="shrink-0 ml-2 px-1.5 py-0.5 text-[11px] leading-none rounded border border-primary-400 dark:border-primary-300 text-primary-600 dark:text-primary-200"
                  >
                    ↵
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
