import { plots } from "@stardle/data/plotdle"
import type { PlotdlePlot } from "@stardle/types"
import clsx from "clsx"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { GuessInput, posterUrl, type Suggestion } from "@/games/_common/components/guess-input"
import { GameHeader } from "@/games/_common/components/header"
import { NextPuzzleCountdown } from "@/games/_common/components/next-puzzle-countdown"
import { ResultBanner } from "@/games/_common/components/result-banner"
import { searchMovie } from "@/lib/tmdb"
import { Icon, type IconName } from "@/shared/components/icon"
import { InlinePanel } from "@/shared/components/inline-panel"
import { ShareTicketButton } from "@/shared/components/share-ticket-button"
import { StatsContent } from "@/shared/components/stats-overlay"
import { TicketDecor } from "@/shared/components/ticket-decor"
import { buildCuratedSearch, normaliseName } from "@/shared/lib/curated-search"
import { formatSerial, todayKey } from "@/shared/lib/date"
import { useKeyboardOpen } from "@/shared/lib/keyboard-viewport"
import { getIncludeAnimated, setIncludeAnimated } from "@/shared/lib/plotdle-prefs"
import { appendResult } from "@/shared/lib/stats"
import { MOVIE_THEATER_COLORS, useWinConfetti } from "@/shared/lib/use-win-confetti"
import { byId, canOpen, dailyPlot, nextArcadePlot } from "../schedule"

const GAME_KEY = "plotdle"
const MAX_GUESSES = 3

interface PlotGuess {
  key: string
  label: string
  year: number | null
}

function stateKey(id: number): string {
  return `filmdle-state:${GAME_KEY}:${id}`
}

type HintId = "character" | "year" | "genre"

/**
 * Hints escalate: year and genre unlock free after the first miss, the main
 * character (the strongest hint) after the second. Players can also tap to
 * reveal one early; only those early taps count toward the 💡 in the share.
 */
/**
 * Steps tried, roomiest first, until the typing view fits above the
 * keyboard: smaller plot text, then dropping the header.
 */
const FIT_STEPS = [
  { plot: "text-lg", header: true },
  { plot: "text-base", header: true },
  { plot: "text-[15px]", header: true },
  { plot: "text-sm", header: true },
  { plot: "text-sm", header: false },
] as const

const HINTS: { id: HintId; label: string; icon: IconName; freeAfterMisses: number }[] = [
  { id: "year", label: "Year", icon: "calendar", freeAfterMisses: 1 },
  { id: "genre", label: "Genre", icon: "masks-theater", freeAfterMisses: 1 },
  { id: "character", label: "Main character", icon: "user", freeAfterMisses: 2 },
]

function hintValue(plot: PlotdlePlot, id: HintId): string {
  if (id === "character") return `“${plot.character}”`
  if (id === "year") return String(plot.year)
  return plot.genre
}

interface PersistedState {
  guesses: PlotGuess[]
  hints: HintId[]
  /** Player chose "Reveal answer": counts as a loss. */
  gaveUp?: boolean
}

function loadState(id: number): PersistedState {
  try {
    const raw = localStorage.getItem(stateKey(id))
    if (!raw) return { guesses: [], hints: [] }
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      guesses: Array.isArray(parsed?.guesses) ? parsed.guesses : [],
      hints: Array.isArray(parsed?.hints) ? parsed.hints : [],
      gaveUp: parsed?.gaveUp === true,
    }
  } catch {
    return { guesses: [], hints: [] }
  }
}

function saveState(id: number, state: PersistedState): void {
  try {
    localStorage.setItem(stateKey(id), JSON.stringify(state))
  } catch {
    // ignore
  }
}

function isCorrectGuess(guess: PlotGuess, answer: PlotdlePlot): boolean {
  if (guess.key === `p:${answer.id}`) return true
  if (answer.tmdbId && guess.key === `t:${answer.tmdbId}`) return true
  // Fallback for plots not yet synced to TMDB: same title, release year within one.
  if (normaliseName(guess.label) !== normaliseName(answer.title)) return false
  return guess.year === null || Math.abs(guess.year - answer.year) <= 1
}

function shareUrl(id: number): string {
  return `${window.location.origin}/plotdle/${id}`
}

function buildShareText(
  plot: PlotdlePlot,
  guesses: PlotGuess[],
  won: boolean,
  hintsUsed: number,
  gaveUp: boolean,
): string {
  const lines = [
    `Plotdle #${formatSerial(plot.id)}: guess the movie from this poorly explained plot`,
    "",
  ]
  lines.push(`"${plot.plot}"${plot.animated ? " (animated)" : ""}`)
  if (guesses.length > 0 || gaveUp) {
    const squares = guesses.map((g) => (isCorrectGuess(g, plot) ? "🟩" : "🟥")).join("")
    const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`
    const hints = hintsUsed > 0 ? ` 💡${hintsUsed}` : ""
    const flag = gaveUp ? " 🏳️" : ""
    lines.push("", `${squares}${squares ? " " : ""}${score}${hints}${flag}`)
  }
  lines.push("", shareUrl(plot.id))
  return lines.join("\n")
}

function introKey(id: number): string {
  return `filmdle-intro:${GAME_KEY}:${id}`
}

function introSeen(id: number): boolean {
  try {
    return localStorage.getItem(introKey(id)) !== null
  } catch {
    return false
  }
}

function markIntroSeen(id: number): void {
  try {
    localStorage.setItem(introKey(id), "1")
  } catch {
    // ignore
  }
}

/** Marquee title card shown before today's untouched daily plot. */
function NowShowing({ serial, animated }: { serial: number; animated: boolean }) {
  return (
    <div className="now-showing flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-[11px] uppercase tracking-[0.35em] text-danger-600 dark:text-danger-500">
        ★ Now showing ★
      </p>
      <div className="now-showing-marquee w-full max-w-sm px-5 py-6">
        <p className="text-[11px] uppercase tracking-[0.25em] text-primary-500 dark:text-primary-300">
          Tonight's feature
        </p>
        <p className="marquee mt-1 text-4xl uppercase text-primary-900 dark:text-primary-50">
          Mystery movie
        </p>
        <p className="mt-1 text-sm text-primary-600 dark:text-primary-300">
          Daily Plotdle № {formatSerial(serial)}
          {animated ? " · Animated" : ""}
        </p>
      </div>
      <dl className="ticket-fields">
        <div>
          <dt>Runtime</dt>
          <dd>3 guesses</dd>
        </div>
        <div>
          <dt>Rated</dt>
          <dd>PE</dd>
        </div>
        <div>
          <dt>Showing</dt>
          <dd>Today only</dd>
        </div>
      </dl>
      <p className="max-w-xs text-xs text-primary-500 dark:text-primary-300">
        Rated PE: Poorly Explained. Name the movie from its plot.
      </p>
    </div>
  )
}

function hasPlayed(id: number): boolean {
  try {
    return localStorage.getItem(stateKey(id)) !== null
  } catch {
    return false
  }
}

export default function PlotdleGame() {
  const { id: idParam } = useParams()
  const navigate = useNavigate()
  const today = useMemo(() => todayKey(), [])
  const daily = useMemo(() => dailyPlot(today), [today])

  // ?preview=1 opens any plot (even a future daily) fresh, for trying it out
  // or taking a screenshot. Nothing is saved and it never counts in stats.
  const [searchParams] = useSearchParams()
  const preview = idParam !== undefined && searchParams.get("preview") === "1"

  const answer = idParam === undefined ? daily : byId.get(Number(idParam))
  // Unknown ids and not-yet-released dailies fall back to today's puzzle.
  if (!answer || (!preview && !canOpen(answer, today))) return <Navigate to="/plotdle" replace />

  // Remount per puzzle so guess state resets cleanly when navigating between plots.
  return (
    <PlotScreen
      key={`${answer.id}:${preview}`}
      answer={answer}
      isDaily={!preview && answer.id === daily.id}
      preview={preview}
      today={today}
      onNext={() => {
        const next = nextArcadePlot(answer.id, today, getIncludeAnimated(), hasPlayed)
        navigate(next ? `/plotdle/${next.id}` : "/plotdle")
      }}
    />
  )
}

function PlotScreen({
  answer,
  isDaily,
  preview,
  today,
  onNext,
}: {
  answer: PlotdlePlot
  isDaily: boolean
  /** Fresh, unsaved run of any plot (see PlotdleGame). */
  preview: boolean
  today: string
  onNext: () => void
}) {
  const curated = useMemo(
    () =>
      buildCuratedSearch(
        plots.map((p) => ({ ...p, id: String(p.id) })),
        "title",
      ),
    [],
  )
  const [{ guesses, hints, gaveUp = false }, setState] = useState<PersistedState>(() =>
    preview ? { guesses: [], hints: [] } : loadState(answer.id),
  )
  // Previews never touch the player's saved games.
  const persist = (id: number, state: PersistedState) => {
    if (!preview) saveState(id, state)
  }
  const [statsOpen, setStatsOpen] = useState(false)
  // A "Now Showing" title card opens an untouched daily puzzle, once.
  const [introOpen, setIntroOpen] = useState(() => {
    if (!isDaily || introSeen(answer.id)) return false
    const saved = loadState(answer.id)
    return saved.guesses.length === 0 && saved.hints.length === 0 && !saved.gaveUp
  })
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle")
  // Revealing ends the game, so it takes a second tap to confirm.
  const [confirmReveal, setConfirmReveal] = useState(false)
  const [includeAnimated, setIncludeAnimatedState] = useState(getIncludeAnimated)
  // After the game, "Hide answer" redraws the screen as a fresh, unplayed
  // puzzle so it can be shown to or screenshotted for someone else.
  const [answerHidden, setAnswerHidden] = useState(false)
  const keyboardOpen = useKeyboardOpen()
  const contentRef = useRef<HTMLDivElement>(null)
  // 0 = normal plot text; each step shrinks it until it fits above the keyboard.
  const [fitLevel, setFitLevel] = useState(0)
  // Hints the other person has tapped open while the answer is hidden. Not saved.
  const [maskedHints, setMaskedHints] = useState<HintId[]>([])

  const won = guesses.some((g) => isCorrectGuess(g, answer))
  const lost = !won && (gaveUp || guesses.length >= MAX_GUESSES)
  const gameOver = won || lost
  const guessedKeys = useMemo(() => new Set(guesses.map((g) => g.key)), [guesses])
  const misses = guesses.filter((g) => !isCorrectGuess(g, answer)).length
  // Hints earned by missing; these never count as "used" in the share.
  const unlocked = new Set(HINTS.filter((h) => misses >= h.freeAfterMisses).map((h) => h.id))
  const suggestionMeta = useRef(new Map<string, { label: string; year: number | null }>())

  const recordedRef = useRef(false)
  useEffect(() => {
    if (!isDaily || !gameOver || recordedRef.current) return
    recordedRef.current = true
    appendResult(GAME_KEY, {
      dateKey: today,
      answerId: String(answer.id),
      guesses: guesses.map((g) => g.label),
      outcome: won ? "win" : "loss",
      guessCount: guesses.length,
    })
  }, [isDaily, gameOver, today, answer.id, guesses, won])

  useWinConfetti({
    won,
    colors: MOVIE_THEATER_COLORS,
    dedupKey: `${GAME_KEY}:${answer.id}`,
  })

  const fetchSuggestions = useCallback(
    async (query: string, signal: AbortSignal): Promise<Suggestion[]> => {
      const local = curated.search(query, 4)
      const out: Suggestion[] = local.map((p) => ({
        key: `p:${p.id}`,
        label: p.title,
        sublabel: String(p.year),
      }))
      const seen = new Set(local.map((p) => `${normaliseName(p.title)}:${p.year}`))
      for (const p of local)
        suggestionMeta.current.set(`p:${p.id}`, { label: p.title, year: p.year })

      let tmdb: Awaited<ReturnType<typeof searchMovie>> = []
      try {
        tmdb = await searchMovie(query, signal)
      } catch (err) {
        if ((err as Error).name === "AbortError") throw err
        // Nothing local to fall back on: let the guess box say search failed.
        if (local.length === 0) throw err
      }
      // Curated plots carry no poster: borrow it from the matching TMDB hit.
      for (const [i, p] of local.entries()) {
        const match =
          tmdb.find((r) => p.tmdbId && r.id === p.tmdbId) ??
          tmdb.find(
            (r) =>
              normaliseName(r.title) === normaliseName(p.title) &&
              r.release_date?.startsWith(String(p.year)),
          )
        const row = out[i]
        if (row) row.imageUrl = posterUrl(match?.poster_path)
      }
      for (const r of tmdb) {
        if (out.length >= 8) break
        const year = r.release_date ? Number(r.release_date.slice(0, 4)) : null
        if (seen.has(`${normaliseName(r.title)}:${year}`)) continue
        // A curated plot is the same film as this TMDB hit: keep the curated row only.
        if (local.some((p) => p.tmdbId === r.id)) continue
        const key = `t:${r.id}`
        suggestionMeta.current.set(key, { label: r.title, year })
        out.push({
          key,
          label: r.title,
          sublabel: year ? String(year) : undefined,
          imageUrl: posterUrl(r.poster_path),
        })
      }
      return out
    },
    [curated],
  )

  function handlePick(key: string) {
    if (gameOver || guessedKeys.has(key)) return
    const meta = suggestionMeta.current.get(key) ?? { label: key, year: null }
    setState((prev) => {
      const next = {
        ...prev,
        guesses: [...prev.guesses, { key, label: meta.label, year: meta.year }],
      }
      persist(answer.id, next)
      return next
    })
  }

  function revealHint(id: HintId) {
    if (gameOver || unlocked.has(id)) return
    setState((prev) => {
      if (prev.hints.includes(id)) return prev
      const next = { ...prev, hints: [...prev.hints, id] }
      persist(answer.id, next)
      return next
    })
  }

  function hideAnswer() {
    setMaskedHints([])
    setConfirmReveal(false)
    setAnswerHidden(true)
  }

  function revealAnswer() {
    if (gameOver && !answerHidden) return
    if (!confirmReveal) {
      setConfirmReveal(true)
      window.setTimeout(() => setConfirmReveal(false), 3000)
      return
    }
    setConfirmReveal(false)
    // Hidden after a finished game: just bring the results back.
    if (gameOver) {
      setAnswerHidden(false)
      return
    }
    setState((prev) => {
      const next = { ...prev, gaveUp: true }
      persist(answer.id, next)
      return next
    })
  }

  async function handleShare() {
    // While hidden, share the puzzle link the way an unfinished game does.
    const finished = gameOver && !answerHidden
    const text = buildShareText(
      answer,
      finished ? guesses : [],
      finished && won,
      finished ? hints.length : 0,
      finished && gaveUp,
    )
    try {
      if (navigator.share) {
        await navigator.share({ text })
        return
      }
      await navigator.clipboard.writeText(text)
      setShareStatus("copied")
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      setShareStatus("failed")
    }
    window.setTimeout(() => setShareStatus("idle"), 2000)
  }

  const remaining = MAX_GUESSES - guesses.length
  const masked = gameOver && answerHidden
  // While typing, only the plot and any revealed hints sit above the keyboard,
  // sized to fit without scrolling.
  const typing = keyboardOpen && !gameOver
  // After the game (and while typing) hints are one-line rows.
  const compactHints = (gameOver && !masked) || typing

  // Shrink the plot text until the typing view fits without scrolling.
  useLayoutEffect(() => {
    if (!typing) {
      setFitLevel(0)
      return
    }
    const el = contentRef.current
    if (!el) return
    // Content is bottom-aligned, so overflow spills off the top edge.
    const check = () => {
      const first = el.firstElementChild
      if (first && first.getBoundingClientRect().top < el.getBoundingClientRect().top - 1)
        setFitLevel((l) => Math.min(l + 1, FIT_STEPS.length - 1))
    }
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [typing, fitLevel, hints.length, misses])

  return (
    <div className="app-viewport flex flex-col" data-game={GAME_KEY}>
      <GameHeader
        title="Plotdle"
        // A preview prints the plot's real ticket type, so screenshots match the game.
        mode={isDaily || (preview && answer.pool === "daily") ? "daily" : "arcade"}
        serial={answer.id}
        gameKey={GAME_KEY}
        collapsed={typing && !FIT_STEPS[fitLevel]?.header}
        seat={{ used: masked ? 0 : guesses.length, max: MAX_GUESSES }}
        onOpenStats={() => setStatsOpen((v) => !v)}
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-[var(--ticket-pad-x)] pt-3">
        <div
          className={clsx(
            "crossfade-panel flex flex-1 flex-col overflow-hidden",
            statsOpen ? "crossfade-inactive" : "crossfade-active",
          )}
        >
          {gameOver && !masked && (
            <div className="mb-3">
              <ResultBanner
                won={won}
                answer={`${answer.title} (${answer.year})`}
                guessCount={guesses.length}
                lossMessage={gaveUp ? "Answer revealed" : undefined}
                footer={isDaily ? <NextPuzzleCountdown game="Plotdle" /> : undefined}
                action={
                  <button
                    type="button"
                    onClick={hideAnswer}
                    title="Hide answer"
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[10px] uppercase tracking-wider text-primary-600 transition-colors hover:bg-primary-600/10 dark:text-primary-300 dark:hover:bg-primary-700"
                  >
                    <Icon name="eye-slash" />
                    Hide
                  </button>
                }
              />
            </div>
          )}

          {introOpen && <NowShowing serial={answer.id} animated={answer.animated} />}

          <div
            ref={contentRef}
            className={clsx(
              "flex min-h-0 flex-1 flex-col",
              typing
                ? "justify-end gap-2 overflow-hidden pb-2"
                : "scroll-fade gap-3 overflow-y-auto overflow-x-hidden pb-4",
              introOpen && "hidden",
            )}
          >
            {!compactHints && (
              <p className="text-center text-xs uppercase tracking-widest text-primary-500 dark:text-primary-300">
                Name the movie from this plot
              </p>
            )}

            <figure
              className={clsx(
                "shrink-0 rounded-md border-2 border-primary-200 bg-primary-50 px-4 dark:border-primary-700 dark:bg-primary-800/60",
                typing ? "px-3 py-2" : compactHints ? "py-3" : "py-4",
              )}
            >
              <blockquote
                className={clsx(
                  "text-center leading-snug text-primary-900 dark:text-primary-50",
                  typing ? FIT_STEPS[fitLevel]?.plot : "text-lg",
                )}
              >
                “{answer.plot}”
              </blockquote>
              {answer.animated && (
                <figcaption className={clsx("flex justify-center", typing ? "mt-1" : "mt-2")}>
                  <span className="rounded-full border border-danger-500/50 px-2 py-0.5 text-[11px] uppercase tracking-widest text-danger-600 dark:text-danger-400">
                    Animated
                  </span>
                </figcaption>
              )}
            </figure>

            <div
              className={clsx(
                "grid shrink-0 grid-cols-2",
                compactHints ? "gap-1.5" : "gap-2",
                typing &&
                  !HINTS.some((h) => unlocked.has(h.id) || hints.includes(h.id)) &&
                  "hidden",
              )}
            >
              {HINTS.map((h) => {
                // Masked: every hint looks untouched, as on a fresh puzzle.
                const shown = masked
                  ? maskedHints.includes(h.id)
                  : gameOver || unlocked.has(h.id) || hints.includes(h.id)
                const remainingMisses = h.freeAfterMisses - (masked ? 0 : misses)
                return (
                  <button
                    key={h.id}
                    type="button"
                    disabled={shown || (gameOver && !masked)}
                    onClick={() =>
                      masked ? setMaskedHints((prev) => [...prev, h.id]) : revealHint(h.id)
                    }
                    aria-label={shown ? undefined : `Reveal hint: ${h.label}`}
                    className={clsx(
                      "flex rounded-md border-2 transition-colors",
                      compactHints
                        ? clsx(
                            "min-w-0 items-baseline gap-2 text-left",
                            typing ? "px-2.5 py-1" : "px-3 py-1.5",
                          )
                        : "flex-col items-center justify-center gap-1 px-2 py-2 text-center",
                      h.id === "character" && "col-span-2",
                      // Unrevealed hints just add distance between plot and keyboard.
                      !shown && typing && "hidden",
                      shown
                        ? "border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-800/60"
                        : "cursor-pointer border-dashed border-primary-300 text-primary-500 hover:border-danger-500/60 hover:text-danger-600 dark:border-primary-500/70 dark:text-primary-300 dark:hover:border-primary-300 dark:hover:text-primary-100",
                    )}
                  >
                    <span className="flex shrink-0 items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary-500 dark:text-primary-300">
                      <Icon name={h.icon} />
                      {compactHints ? <span className="sr-only">{h.label}</span> : h.label}
                    </span>
                    <span
                      className={clsx(
                        typing ? "text-[13px]" : "text-sm",
                        compactHints && "min-w-0",
                        typing && "truncate",
                        shown
                          ? "text-primary-900 dark:text-primary-50"
                          : "text-xs italic text-primary-500 dark:text-primary-300",
                      )}
                    >
                      {shown ? hintValue(answer, h.id) : "Tap to reveal"}
                    </span>
                    {!shown && (
                      <span className="text-[11px] text-primary-500 dark:text-primary-300">
                        Free after {remainingMisses} {remainingMisses === 1 ? "miss" : "misses"}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {(!gameOver || masked) && !typing && (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs uppercase tracking-wider text-danger-600 transition-colors hover:bg-danger-600/10 dark:text-primary-100 dark:hover:bg-primary-700"
                >
                  <Icon name="share-nodes" />
                  {shareStatus === "copied"
                    ? "Link copied"
                    : shareStatus === "failed"
                      ? "Couldn't copy"
                      : "Send to a friend"}
                </button>
                <button
                  type="button"
                  onClick={revealAnswer}
                  className={clsx(
                    "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs uppercase tracking-wider transition-colors",
                    confirmReveal
                      ? "bg-danger-600 text-primary-50 hover:bg-danger-700 dark:bg-danger-500 dark:hover:bg-danger-600"
                      : "text-primary-600 hover:bg-primary-600/10 dark:text-primary-300 dark:hover:bg-primary-700",
                  )}
                >
                  <Icon name="eye" />
                  {confirmReveal ? "Tap again to reveal" : "Reveal answer"}
                </button>
                {!isDaily && !preview && !masked && (
                  <button
                    type="button"
                    onClick={onNext}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs uppercase tracking-wider text-danger-600 transition-colors hover:bg-danger-600/10 dark:text-danger-400 dark:hover:bg-danger-500/20"
                  >
                    Next plot
                    <Icon name="chevron-right" />
                  </button>
                )}
              </div>
            )}

            {guesses.length > 0 && !masked && !typing && (
              <div className="shrink-0">
                <p className="mb-1.5 text-[11px] uppercase tracking-widest text-primary-500 dark:text-primary-300">
                  Guesses
                </p>
                <div className="flex flex-col gap-1.5">
                  {guesses.map((g, i) => (
                    <GuessRow
                      key={g.key}
                      number={i + 1}
                      label={g.year ? `${g.label} (${g.year})` : g.label}
                      correct={isCorrectGuess(g, answer)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ticket-stub flex h-[var(--tear-height)] shrink-0 flex-col justify-center">
            {masked ? (
              <div className="mx-3">
                <p className="mb-1 text-center text-[11px] uppercase tracking-widest text-primary-500 dark:text-primary-300">
                  {MAX_GUESSES} guesses remaining
                </p>
                {/* Looks like the guess box (no typing); the eye brings the answer back. */}
                <div className="relative mx-auto max-w-xs">
                  <div className="w-full rounded-lg border-2 border-primary-300 bg-primary-100 px-4 py-3 text-base text-primary-500 dark:border-primary-700 dark:bg-primary-800 dark:text-primary-300">
                    Type a movie title…
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnswerHidden(false)}
                    aria-label="Show answer"
                    title="Show answer"
                    className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-primary-500 transition-colors hover:bg-primary-200 hover:text-primary-700 dark:text-primary-300 dark:hover:bg-primary-700 dark:hover:text-primary-100"
                  >
                    <Icon name="eye" />
                  </button>
                </div>
              </div>
            ) : introOpen ? (
              <div className="mx-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    markIntroSeen(answer.id)
                    setIntroOpen(false)
                  }}
                  className={clsx(
                    "flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 uppercase tracking-wide transition-colors",
                    "bg-danger-600 text-primary-50 hover:bg-danger-700",
                    "dark:bg-danger-500 dark:hover:bg-danger-600",
                  )}
                >
                  <Icon name="couch" />
                  Take your seat
                </button>
              </div>
            ) : gameOver ? (
              <div className="mx-3 flex flex-col items-center gap-2">
                <div className="flex w-full justify-center gap-2 min-[400px]:gap-3">
                  {/* Under 400px wide Share is icon-only, like the ticket button, so Play Again fits. */}
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label={shareStatus === "copied" ? "Copied" : "Share"}
                    className={clsx(
                      "flex w-12 flex-none cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 py-3 uppercase tracking-wide transition-colors min-[400px]:w-auto min-[400px]:max-w-[11rem] min-[400px]:flex-1 min-[400px]:px-3",
                      "border-danger-600 text-danger-600 hover:bg-danger-600/10",
                      "dark:border-danger-500 dark:text-primary-50 dark:hover:bg-danger-500/20",
                    )}
                  >
                    <Icon name={shareStatus === "copied" ? "check" : "share-nodes"} />
                    <span className="max-[399px]:sr-only">
                      {shareStatus === "copied"
                        ? "Copied"
                        : shareStatus === "failed"
                          ? "Try again"
                          : "Share"}
                    </span>
                  </button>
                  <ShareTicketButton
                    ticket={() => ({
                      game: "Plotdle",
                      mode: isDaily ? "daily" : "arcade",
                      serial: answer.id,
                      marks: guesses.map((g) => isCorrectGuess(g, answer)),
                      maxGuesses: MAX_GUESSES,
                      won,
                      quote: answer.plot,
                    })}
                  />
                  <button
                    type="button"
                    onClick={onNext}
                    className={clsx(
                      "flex flex-1 max-w-[11rem] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 border-transparent px-3 py-3 uppercase tracking-wide transition-colors",
                      "bg-danger-600 text-primary-50 hover:bg-danger-700",
                      "dark:bg-danger-500 dark:hover:bg-danger-600",
                    )}
                  >
                    <Icon name="rotate-right" />
                    Play Again
                  </button>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-widest text-primary-600 dark:text-primary-300">
                  <input
                    type="checkbox"
                    checked={includeAnimated}
                    onChange={(e) => {
                      setIncludeAnimated(e.target.checked)
                      setIncludeAnimatedState(e.target.checked)
                    }}
                    className="h-4 w-4 cursor-pointer accent-danger-600"
                  />
                  Include animated films
                </label>
              </div>
            ) : (
              <div className="mx-3">
                <p className="mb-1 text-center text-[11px] uppercase tracking-widest text-primary-500 kb:hidden dark:text-primary-300">
                  {remaining} {remaining === 1 ? "guess" : "guesses"} remaining
                </p>
                <GuessInput
                  disabled={false}
                  guessedKeys={guessedKeys}
                  placeholder="Type a movie title…"
                  fetchSuggestions={fetchSuggestions}
                  onPick={handlePick}
                />
              </div>
            )}
          </div>
        </div>
        <InlinePanel
          open={statsOpen}
          title="Stats"
          onClose={() => setStatsOpen(false)}
          className="px-[var(--ticket-pad-x)] pt-3 pb-[var(--ticket-safe-bottom)]"
        >
          <StatsContent open={statsOpen} defaultGame="plotdle" />
        </InlinePanel>
      </div>
      <TicketDecor code={formatSerial(answer.id)} torn={gameOver && !masked} />
    </div>
  )
}

function GuessRow({ number, label, correct }: { number: number; label: string; correct: boolean }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2.5 rounded-md border px-3 py-2",
        correct
          ? "border-success-500/40 bg-success-500/10 dark:border-success-400/50 dark:bg-success-500/15"
          : "border-danger-500/40 bg-danger-500/10 dark:border-danger-500/30 dark:bg-danger-500/15",
      )}
    >
      <span className="w-4 shrink-0 text-right text-[11px] text-primary-500 dark:text-primary-300">
        {number}
      </span>
      <div
        className={clsx(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold text-primary-50",
          correct ? "bg-success-500" : "bg-danger-500",
        )}
      >
        {correct ? "✓" : "✕"}
      </div>
      <span
        className={clsx(
          "text-sm",
          correct
            ? "text-success-700 dark:text-success-400"
            : "text-primary-800 dark:text-primary-200",
        )}
      >
        {label}
      </span>
    </div>
  )
}
