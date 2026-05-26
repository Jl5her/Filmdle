import clsx from "clsx"
import { useEffect, useMemo, useRef, useState } from "react"
import { InlinePanel } from "@/shared/components/inline-panel"
import { StatsContent } from "@/shared/components/stats-overlay"
import { todayKey } from "@/shared/lib/date"
import { loadGuesses, saveGuesses } from "@/shared/lib/game-state"
import { minHashPick } from "@/shared/lib/hash"
import { appendResult } from "@/shared/lib/stats"
import type { GameColumn } from "../columns"
import { GuessGrid } from "../components/guess-grid"
import { GuessInput, type Suggestion } from "../components/guess-input"
import { GameHeader } from "../components/header"

const MAX_GUESSES = 5

type Mode = "daily" | "arcade"

interface Props<T> {
  title: string
  curatedItems: T[]
  answerPool: string[]
  idOf: (item: T) => string
  nameOf: (item: T) => string
  columns: GameColumn<T>[]
  searchPlaceholder: string
  gameKey: string
  fetchSuggestions: (query: string, signal: AbortSignal) => Promise<Suggestion[]>
  resolveByKey: (key: string) => Promise<T>
  enrichAnswer?: (answer: T) => Promise<T>
}

export function GameScreen<T>({
  title,
  curatedItems,
  answerPool,
  idOf,
  nameOf,
  columns,
  searchPlaceholder,
  gameKey,
  fetchSuggestions,
  resolveByKey,
  enrichAnswer,
}: Props<T>) {
  const dateKey = useMemo(() => todayKey(), [])
  const [mode, setMode] = useState<Mode>("daily")
  const [arcadeSeed, setArcadeSeed] = useState(0)

  const candidates = useMemo(
    () =>
      answerPool
        .map((id) => curatedItems.find((it) => idOf(it) === id))
        .filter((it): it is T => Boolean(it)),
    [answerPool, curatedItems, idOf],
  )

  const baseAnswer = useMemo(() => {
    if (mode === "daily") {
      return minHashPick(candidates, idOf, `${gameKey}:${dateKey}`)
    }
    const idx = Math.floor(Math.random() * candidates.length)
    return candidates[idx] as T
  }, [candidates, idOf, dateKey, gameKey, mode, arcadeSeed])

  const [answer, setAnswer] = useState<T>(baseAnswer)
  useEffect(() => {
    setAnswer(baseAnswer)
    if (!enrichAnswer) return
    let cancelled = false
    enrichAnswer(baseAnswer).then((enriched) => {
      if (!cancelled) setAnswer(enriched)
    })
    return () => {
      cancelled = true
    }
  }, [baseAnswer, enrichAnswer])

  const [guesses, setGuesses] = useState<T[]>(() => loadGuesses<T>(gameKey, dateKey))
  const [latestIndex, setLatestIndex] = useState(-1)
  const [resolving, setResolving] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)

  const guessedKeys = useMemo(() => new Set(guesses.map(idOf)), [guesses, idOf])
  const won = guesses.some((g) => idOf(g) === idOf(answer))
  const lost = !won && guesses.length >= MAX_GUESSES
  const gameOver = won || lost

  const recordedRef = useRef(false)
  useEffect(() => {
    if (mode !== "daily") return
    if (!gameOver || recordedRef.current) return
    recordedRef.current = true
    appendResult(gameKey, {
      dateKey,
      answerId: idOf(answer),
      guesses: guesses.map(idOf),
      outcome: won ? "win" : "loss",
      guessCount: guesses.length,
    })
  }, [gameOver, gameKey, dateKey, answer, guesses, won, idOf, mode])

  async function handlePick(key: string) {
    if (gameOver || guessedKeys.has(key) || resolving) return
    setResolving(true)
    try {
      const item = await resolveByKey(key)
      if (guessedKeys.has(idOf(item))) return
      setGuesses((prev) => {
        const next = [...prev, item]
        if (mode === "daily") saveGuesses(gameKey, dateKey, next)
        setLatestIndex(next.length - 1)
        return next
      })
    } catch {
      // Swallow — user can try again
    } finally {
      setResolving(false)
    }
  }

  function startNextPuzzle() {
    setGuesses([])
    setLatestIndex(-1)
    recordedRef.current = false
    if (mode === "daily") setMode("arcade")
    else setArcadeSeed((s) => s + 1)
  }

  const nextPuzzleLabel = mode === "daily" ? "Play Again" : "Next Puzzle"

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
            <div
              className={clsx(
                "mb-3 rounded-md border px-3 py-2 text-center text-sm font-semibold",
                won
                  ? "border-success-500 bg-success-500/20 text-success-600 dark:bg-success-600/30 dark:text-success-500"
                  : "border-primary-300 bg-primary-100 text-primary-700 dark:border-primary-600 dark:bg-primary-800 dark:text-primary-100",
              )}
            >
              <div>
                {won
                  ? `Got it in ${guesses.length} ${guesses.length === 1 ? "try" : "tries"} — ${nameOf(answer)}`
                  : `Out of guesses. The answer was ${nameOf(answer)}.`}
              </div>
              <button
                type="button"
                onClick={startNextPuzzle}
                className={clsx(
                  "mt-2 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer",
                  "bg-primary-500 text-primary-50 hover:bg-primary-600",
                  "dark:bg-primary-600 dark:hover:bg-primary-500",
                )}
              >
                {nextPuzzleLabel}
              </button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <GuessGrid
              guesses={guesses}
              answer={answer}
              maxGuesses={MAX_GUESSES}
              latestIndex={latestIndex}
              columns={columns}
              nameOf={nameOf}
            />
          </div>
          <GuessInput
            disabled={gameOver || resolving}
            guessedKeys={guessedKeys}
            placeholder={searchPlaceholder}
            fetchSuggestions={fetchSuggestions}
            onPick={handlePick}
          />
        </div>
        <InlinePanel open={statsOpen} title="Stats" onClose={() => setStatsOpen(false)}>
          <StatsContent open={statsOpen} />
        </InlinePanel>
      </div>
    </div>
  )
}
