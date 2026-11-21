import { plots } from "@stardle/data/plotdle"
import type { PlotdlePlot } from "@stardle/types"
import clsx from "clsx"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { canOpen, dailyNumberOf, playAgainExclusion } from "@/games/plotdle/schedule"
import { GAME_LAUNCH_DATES, todayKey } from "@/shared/lib/date"

const MAX_RESULTS = 30

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const stripArticle = (s: string) => s.replace(/^(the|a|an) /, "")

interface Entry {
  plot: PlotdlePlot
  title: string
  bare: string
  words: string[]
}

const ENTRIES: Entry[] = plots
  .map((plot) => {
    const title = norm(plot.title)
    return { plot, title, bare: stripArticle(title), words: title.split(" ") }
  })
  .sort((a, b) => a.plot.title.localeCompare(b.plot.title))

function score(e: Entry, q: string, words: string[], year: number | null): number {
  if (year !== null && e.plot.year !== year) return 0
  if (!q) return year !== null ? 1 : 0
  if (e.title === q || e.bare === q) return 4
  if (e.title.startsWith(q) || e.bare.startsWith(q)) return 3
  if (words.every((w) => e.words.some((tw) => tw.startsWith(w)))) return 2
  if (e.title.includes(q)) return 1
  return 0
}

/** Title search; a trailing year ("king kong 1933") narrows to that year. */
function search(raw: string): PlotdlePlot[] {
  let q = norm(raw)
  let year: number | null = null
  const m = q.match(/(?:^| )((?:19|20)\d\d)$/)
  if (m?.[1]) {
    year = Number(m[1])
    q = q.slice(0, m.index).trim()
  }
  const words = q.split(" ").filter(Boolean)
  return ENTRIES.map((e) => [score(e, q, words, year), e] as const)
    .filter(([s]) => s > 0)
    .sort(
      ([sa, a], [sb, b]) =>
        sb - sa || a.plot.title.length - b.plot.title.length || a.plot.year - b.plot.year,
    )
    .map(([, e]) => e.plot)
}

function dailyDate(n: number): string {
  const [y, m, d] = (GAME_LAUNCH_DATES.plotdle ?? "2026-11-18").split("-").map(Number) as [
    number,
    number,
    number,
  ]
  return new Date(y, m - 1, d + n - 1).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function DebugPlots() {
  const [query, setQuery] = useState("")
  const today = useMemo(() => todayKey(), [])
  const results = useMemo(() => (query.trim() ? search(query) : []), [query])

  return (
    <div className="app-viewport flex flex-col">
      <header className="ticket-header-rule relative px-4 py-3 text-center">
        <Link
          to="/"
          aria-label="Back to menu"
          title="Back"
          className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-2xl leading-none text-primary-700 transition-colors hover:bg-primary-200 dark:text-primary-50 dark:hover:bg-primary-700"
        >
          ‹
        </Link>
        <h1 className="fa5-title text-3xl uppercase text-primary-900 dark:text-primary-50">
          Plot Lookup
        </h1>
        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-warning-600 dark:text-warning-500">
          Debug · spoilers
        </p>
      </header>

      <div className="px-[var(--ticket-pad-x)] pt-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a movie, e.g. Jaws or King Kong 1933"
          aria-label="Movie title"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full rounded-lg border-2 border-primary-300 bg-primary-100 px-4 py-3 text-base text-primary-900 outline-none placeholder:text-primary-500 focus:border-primary-500 dark:border-primary-700 dark:bg-primary-800 dark:text-primary-50 dark:placeholder:text-primary-400 dark:focus:border-primary-400 [&::-webkit-search-cancel-button]:appearance-none"
        />
        <p className="mt-2 text-[11px] uppercase tracking-wider text-primary-500 dark:text-primary-300">
          {!query.trim()
            ? `${plots.length.toLocaleString()} movies have a plot`
            : results.length === 0
              ? "No plot for that movie"
              : `${results.length} ${results.length === 1 ? "match" : "matches"}${
                  results.length > MAX_RESULTS ? `, showing ${MAX_RESULTS}` : ""
                }`}
        </p>
      </div>

      <div className="mb-[var(--ticket-safe-bottom)] scroll-fade min-h-0 flex-1 overflow-y-auto px-[var(--ticket-pad-x)] pt-2 pb-4">
        <ul className="flex flex-col gap-2.5">
          {results.slice(0, MAX_RESULTS).map((p) => (
            <PlotCard key={p.id} plot={p} playable={canOpen(p, today)} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function PlotCard({ plot, playable }: { plot: PlotdlePlot; playable: boolean }) {
  const daily = dailyNumberOf(plot)
  const excluded = playAgainExclusion(plot)

  return (
    <li className="rounded-md border-2 border-primary-200 px-3 py-2.5 dark:border-primary-700">
      <p className="text-[15px] font-semibold leading-snug text-primary-900 dark:text-primary-50">
        “{plot.plot}”
      </p>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
        <span className="ticket-script text-danger-600 dark:text-danger-500">{plot.title}</span>
        <span className="text-xs text-primary-500 dark:text-primary-300">{plot.year}</span>
      </div>
      <p className="mt-1 text-xs text-primary-600 dark:text-primary-300">
        <span className="mr-1.5 font-semibold uppercase tracking-wider">Character</span>
        {plot.character}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip>{plot.difficulty}</Chip>
        <Chip>{plot.genre}</Chip>
        {plot.animated && <Chip>Animated</Chip>}
        {daily !== undefined ? (
          <Chip strong>
            Daily #{daily} · {dailyDate(daily)}
          </Chip>
        ) : (
          <Chip>Arcade</Chip>
        )}
        <Chip strong={!excluded}>
          {excluded ? `Play Again: no (${excluded})` : "Play Again: yes"}
        </Chip>
        {plot.franchise && <Chip>{plot.franchise}</Chip>}
        {playable && (
          <Link
            to={`/plotdle/${plot.id}`}
            className="ml-auto text-xs uppercase tracking-wider text-danger-600 underline-offset-2 hover:underline dark:text-danger-500"
          >
            Play
          </Link>
        )}
      </div>
    </li>
  )
}

function Chip({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={clsx(
        "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider",
        strong
          ? "border-primary-500 text-primary-800 dark:border-primary-300 dark:text-primary-100"
          : "border-primary-300 text-primary-500 dark:border-primary-600 dark:text-primary-300",
      )}
    >
      {children}
    </span>
  )
}
