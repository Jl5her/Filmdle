import type { CreditdleActor, CreditdleCredit } from "@stardle/types"
import clsx from "clsx"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Suggestion } from "@/games/_common/components/guess-input"
import { GuessInput } from "@/games/_common/components/guess-input"
import { GameHeader } from "@/games/_common/components/header"
import { ResultBanner } from "@/games/_common/components/result-banner"
import { searchPerson } from "@/lib/tmdb"
import { InlinePanel } from "@/shared/components/inline-panel"
import { StatsContent } from "@/shared/components/stats-overlay"
import { buildCuratedSearch, normaliseName } from "@/shared/lib/curated-search"
import { todayKey } from "@/shared/lib/date"
import { fnv1a, minHashPick } from "@/shared/lib/hash"
import { appendResult } from "@/shared/lib/stats"
import { MOVIE_THEATER_COLORS, useWinConfetti } from "@/shared/lib/use-win-confetti"

const MAX_GUESSES = 6
const MAX_CREDITS = 5

type Mode = "daily" | "arcade"

interface CreditGuess {
  key: string
  label: string
}

interface PersistedState {
  guesses: CreditGuess[]
  answerId: string
}

const STATE_PREFIX = "filmdle-state"

function persistKey(gameKey: string, dateKey: string): string {
  return `${STATE_PREFIX}:${gameKey}:${dateKey}`
}

function loadState(gameKey: string, dateKey: string): CreditGuess[] {
  try {
    const raw = localStorage.getItem(persistKey(gameKey, dateKey))
    if (!raw) return []
    const parsed = JSON.parse(raw) as PersistedState
    return Array.isArray(parsed?.guesses) ? parsed.guesses : []
  } catch {
    return []
  }
}

function saveState(
  gameKey: string,
  dateKey: string,
  answerId: string,
  guesses: CreditGuess[],
): void {
  try {
    const s: PersistedState = { guesses, answerId }
    localStorage.setItem(persistKey(gameKey, dateKey), JSON.stringify(s))
  } catch {
    // ignore
  }
}

function deterministicShuffle<T>(arr: T[], seed: string): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const h = fnv1a(`${seed}:${i}`)
    const j = h % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function isCorrectGuess(guess: CreditGuess, answer: CreditdleActor): boolean {
  if (guess.key === `c:${answer.id}`) return true
  if (guess.key === `t:${answer.tmdbId}`) return true
  return normaliseName(guess.label) === normaliseName(answer.name)
}

interface Props {
  title: string
  gameKey: string
  actors: CreditdleActor[]
  answerPool: string[]
  mediaLabel: string
}

export function CreditScreen({ title, gameKey, actors, answerPool, mediaLabel }: Props) {
  const dateKey = useMemo(() => todayKey(), [])
  const [mode, setMode] = useState<Mode>("daily")
  const [arcadeSeed, setArcadeSeed] = useState(0)

  const curated = useMemo(() => buildCuratedSearch(actors, "name"), [actors])

  const candidates = useMemo(
    () =>
      answerPool
        .map((id) => actors.find((a) => a.id === id))
        .filter((a): a is CreditdleActor => Boolean(a)),
    [answerPool, actors],
  )

  const answer = useMemo(() => {
    if (mode === "daily") return minHashPick(candidates, (a) => a.id, `${gameKey}:${dateKey}`)
    const idx = Math.floor(Math.random() * candidates.length)
    return candidates[idx] as CreditdleActor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates, dateKey, gameKey, mode, arcadeSeed])

  const shuffledCredits = useMemo((): CreditdleCredit[] => {
    const seed = mode === "daily" ? `${gameKey}:${dateKey}` : `${gameKey}:arcade:${arcadeSeed}`
    return deterministicShuffle(answer.credits, seed)
  }, [answer, gameKey, dateKey, mode, arcadeSeed])

  const [guesses, setGuesses] = useState<CreditGuess[]>(() =>
    mode === "daily" ? loadState(gameKey, dateKey) : [],
  )
  const [statsOpen, setStatsOpen] = useState(false)

  const wrongGuesses = useMemo(
    () => guesses.filter((g) => !isCorrectGuess(g, answer)),
    [guesses, answer],
  )
  const won = guesses.some((g) => isCorrectGuess(g, answer))
  const lost = !won && guesses.length >= MAX_GUESSES
  const gameOver = won || lost

  const revealedCount = Math.min(wrongGuesses.length + 1, MAX_CREDITS)
  const visibleCredits = shuffledCredits.slice(0, revealedCount)

  const guessedKeys = useMemo(() => new Set(guesses.map((g) => g.key)), [guesses])

  // Cache suggestion labels so handlePick can look up the actor name by key
  const suggestionLabels = useRef(new Map<string, string>())

  const recordedRef = useRef(false)
  useEffect(() => {
    if (mode !== "daily") return
    if (!gameOver || recordedRef.current) return
    recordedRef.current = true
    appendResult(gameKey, {
      dateKey,
      answerId: answer.id,
      guesses: guesses.map((g) => g.label),
      outcome: won ? "win" : "loss",
      guessCount: guesses.length,
    })
  }, [gameOver, gameKey, dateKey, answer, guesses, won, mode])

  useWinConfetti({
    won,
    colors: MOVIE_THEATER_COLORS,
    dedupKey: `${gameKey}:${mode}:${mode === "daily" ? dateKey : arcadeSeed}:${answer.id}`,
  })

  const fetchSuggestions = useCallback(
    async (query: string, signal: AbortSignal): Promise<Suggestion[]> => {
      const localMatches = curated.search(query, 4)
      const localSuggestions: Suggestion[] = localMatches.map((a) => ({
        key: `c:${a.id}`,
        label: a.name,
      }))
      const seen = new Set(localMatches.map((a) => normaliseName(a.name)))

      let tmdbResults: Awaited<ReturnType<typeof searchPerson>> = []
      try {
        tmdbResults = (await searchPerson(query, signal)).slice(0, 8)
      } catch (err) {
        if ((err as Error).name === "AbortError") throw err
      }
      const tmdbSuggestions: Suggestion[] = []
      for (const r of tmdbResults) {
        if (seen.has(normaliseName(r.name))) continue
        tmdbSuggestions.push({ key: `t:${r.id}`, label: r.name })
        if (localSuggestions.length + tmdbSuggestions.length >= 8) break
      }

      const all = [...localSuggestions, ...tmdbSuggestions]
      for (const s of all) suggestionLabels.current.set(s.key, s.label)
      return all
    },
    [curated],
  )

  function handlePick(key: string) {
    if (gameOver || guessedKeys.has(key)) return
    const label = suggestionLabels.current.get(key) ?? key
    const guess: CreditGuess = { key, label }
    setGuesses((prev) => {
      const next = [...prev, guess]
      if (mode === "daily") saveState(gameKey, dateKey, answer.id, next)
      return next
    })
  }

  function startNextPuzzle() {
    setGuesses([])
    recordedRef.current = false
    if (mode === "daily") setMode("arcade")
    else setArcadeSeed((s) => s + 1)
  }

  const remainingGuesses = MAX_GUESSES - guesses.length

  return (
    <div className="app-viewport flex flex-col">
      <GameHeader title={title} mode={mode} onOpenStats={() => setStatsOpen((v) => !v)} />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3">
        <div
          className={clsx(
            "crossfade-panel flex flex-1 flex-col overflow-hidden",
            statsOpen ? "crossfade-inactive" : "crossfade-active",
          )}
        >
          {gameOver && (
            <div className="mb-3">
              <ResultBanner won={won} answer={answer.name} guessCount={guesses.length} />
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-2 space-y-3">
            <p className="text-center text-xs uppercase tracking-widest text-primary-500 dark:text-primary-400">
              Who appeared in these {mediaLabel}?
            </p>

            <div className="flex flex-col gap-2">
              {visibleCredits.map((credit, i) => (
                <CreditCard
                  key={credit.tmdbId !== 0 ? credit.tmdbId : `${credit.title}-${credit.year}`}
                  credit={credit}
                  index={i}
                  isNew={!gameOver && i === visibleCredits.length - 1 && i > 0}
                />
              ))}
              {!gameOver && revealedCount < MAX_CREDITS && <LockedCard index={revealedCount} />}
            </div>

            {wrongGuesses.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] uppercase tracking-widest text-primary-500 dark:text-primary-400">
                  Wrong guesses
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {wrongGuesses.map((g) => (
                    <WrongGuessBadge key={g.key} label={g.label} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-col justify-center h-[var(--tear-height)]">
            {gameOver ? (
              <div className="mx-3 flex justify-center">
                <button
                  type="button"
                  onClick={startNextPuzzle}
                  className={clsx(
                    "w-full max-w-xs px-6 py-3 rounded-md uppercase tracking-wide transition-colors cursor-pointer",
                    "bg-danger-600 text-primary-50 hover:bg-danger-700",
                    "dark:bg-danger-500 dark:hover:bg-danger-600",
                  )}
                >
                  {mode === "daily" ? "Play Again" : "Next Puzzle"}
                </button>
              </div>
            ) : (
              <div className="mx-3">
                <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-primary-500 dark:text-primary-400">
                  {remainingGuesses} {remainingGuesses === 1 ? "guess" : "guesses"} remaining
                </p>
                <GuessInput
                  disabled={false}
                  guessedKeys={guessedKeys}
                  placeholder="Type an actor or actress…"
                  fetchSuggestions={fetchSuggestions}
                  onPick={handlePick}
                />
              </div>
            )}
          </div>
        </div>
        <InlinePanel open={statsOpen} title="Stats" onClose={() => setStatsOpen(false)}>
          <StatsContent open={statsOpen} defaultGame={gameKey as "creditdle" | "showdle"} />
        </InlinePanel>
      </div>
    </div>
  )
}

function CreditCard({
  credit,
  index,
  isNew,
}: {
  credit: CreditdleCredit
  index: number
  isNew: boolean
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-md border-2 px-3 py-2.5",
        "bg-primary-50 dark:bg-primary-800/60",
        isNew
          ? "border-danger-500/60 dark:border-danger-400/60"
          : "border-primary-200 dark:border-primary-700",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-danger-600 text-sm font-bold text-primary-50 dark:bg-danger-500">
        {index + 1}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-primary-900 dark:text-primary-50">
          {credit.title}
        </span>
        <span className="text-xs text-primary-500 dark:text-primary-400">{credit.year}</span>
      </div>
    </div>
  )
}

function LockedCard({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-3 rounded-md border-2 border-dashed border-primary-300 px-3 py-2.5 dark:border-primary-700">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-200 text-xs font-bold text-primary-400 dark:bg-primary-800 dark:text-primary-500">
        {index + 1}
      </div>
      <p className="text-xs italic text-primary-400 dark:text-primary-500">
        Revealed after a wrong guess
      </p>
    </div>
  )
}

function WrongGuessBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-danger-500/15 px-2.5 py-1 text-xs text-danger-700 dark:bg-danger-500/20 dark:text-danger-400">
      <span aria-hidden="true" className="text-danger-500">
        ✕
      </span>
      {label}
    </span>
  )
}
