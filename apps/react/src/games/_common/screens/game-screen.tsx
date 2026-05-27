import clsx from "clsx"
import { useEffect, useMemo, useRef, useState } from "react"
import { HowToPlayContent } from "@/shared/components/how-to-play-overlay"
import { InlinePanel } from "@/shared/components/inline-panel"
import { StatsContent } from "@/shared/components/stats-overlay"
import { todayKey } from "@/shared/lib/date"
import { loadGuesses, saveGuesses } from "@/shared/lib/game-state"
import { minHashPick } from "@/shared/lib/hash"
import { hasSeenHowToPlay, markHowToPlaySeen } from "@/shared/lib/how-to-play-seen"
import { appendResult } from "@/shared/lib/stats"
import { MOVIE_THEATER_COLORS, useWinConfetti } from "@/shared/lib/use-win-confetti"
import type { GameColumn } from "../columns"
import { GuessGrid } from "../components/guess-grid"
import { GuessInput, type Suggestion } from "../components/guess-input"
import { GameHeader } from "../components/header"
import { ResultBanner } from "../components/result-banner"

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
  const [panel, setPanel] = useState<"stats" | "how-to-play" | null>(() =>
    hasSeenHowToPlay(gameKey) ? null : "how-to-play",
  )
  const statsOpen = panel === "stats"
  const howToOpen = panel === "how-to-play"
  const overlayOpen = panel !== null

  function closeHowToPlay() {
    markHowToPlaySeen(gameKey)
    setPanel((p) => (p === "how-to-play" ? null : p))
  }

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

  useWinConfetti({
    won,
    colors: MOVIE_THEATER_COLORS,
    dedupKey: `${gameKey}:${mode}:${mode === "daily" ? dateKey : arcadeSeed}:${idOf(answer)}`,
  })

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
      <GameHeader
        title={title}
        mode={mode}
        onOpenStats={() => setPanel((p) => (p === "stats" ? null : "stats"))}
        onOpenHowToPlay={() => setPanel((p) => (p === "how-to-play" ? null : "how-to-play"))}
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3">
        <div
          className={clsx(
            "crossfade-panel flex flex-1 flex-col overflow-hidden",
            overlayOpen ? "crossfade-inactive" : "crossfade-active",
          )}
        >
          {gameOver && (
            <div className="mb-3">
              <ResultBanner won={won} answer={nameOf(answer)} guessCount={guesses.length} />
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
          <div className="shrink-0 flex flex-col justify-center h-[var(--tear-height)]">
            {gameOver ? (
              <div className="mx-3 flex justify-center">
                <button
                  type="button"
                  onClick={startNextPuzzle}
                  className={clsx(
                    "w-full max-w-xs px-6 py-3 rounded-md font-bold uppercase tracking-wide transition-colors cursor-pointer",
                    "bg-danger-600 text-primary-50 hover:bg-danger-700",
                    "dark:bg-danger-500 dark:hover:bg-danger-600",
                  )}
                >
                  {nextPuzzleLabel}
                </button>
              </div>
            ) : (
              <GuessInput
                disabled={resolving}
                guessedKeys={guessedKeys}
                placeholder={searchPlaceholder}
                fetchSuggestions={fetchSuggestions}
                onPick={handlePick}
              />
            )}
          </div>
        </div>
        <InlinePanel open={statsOpen} title="Stats" onClose={() => setPanel(null)}>
          <StatsContent open={statsOpen} />
        </InlinePanel>
        <InlinePanel open={howToOpen} title="How to Play" onClose={closeHowToPlay}>
          <HowToPlayContent />
        </InlinePanel>
      </div>
    </div>
  )
}
