import { useEffect, useMemo, useRef, useState } from "react"
import { todayKey } from "@/shared/lib/date"
import { loadGuesses, saveGuesses } from "@/shared/lib/game-state"
import { minHashPick } from "@/shared/lib/hash"
import { appendResult } from "@/shared/lib/stats"
import type { GameColumn } from "../columns"
import { GuessGrid } from "../components/guess-grid"
import { GuessInput, type Suggestion } from "../components/guess-input"
import { GameHeader } from "../components/header"

const MAX_GUESSES = 5

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
  const baseAnswer = useMemo(() => {
    const candidates = answerPool
      .map((id) => curatedItems.find((it) => idOf(it) === id))
      .filter((it): it is T => Boolean(it))
    return minHashPick(candidates, idOf, `${gameKey}:${dateKey}`)
  }, [curatedItems, answerPool, idOf, dateKey, gameKey])

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

  const guessedKeys = useMemo(() => new Set(guesses.map(idOf)), [guesses, idOf])
  const won = guesses.some((g) => idOf(g) === idOf(answer))
  const lost = !won && guesses.length >= MAX_GUESSES
  const gameOver = won || lost

  const recordedRef = useRef(false)
  useEffect(() => {
    if (!gameOver || recordedRef.current) return
    recordedRef.current = true
    appendResult(gameKey, {
      dateKey,
      answerId: idOf(answer),
      guesses: guesses.map(idOf),
      outcome: won ? "win" : "loss",
      guessCount: guesses.length,
    })
  }, [gameOver, gameKey, dateKey, answer, guesses, won, idOf])

  async function handlePick(key: string) {
    if (gameOver || guessedKeys.has(key) || resolving) return
    setResolving(true)
    try {
      const item = await resolveByKey(key)
      if (guessedKeys.has(idOf(item))) return
      setGuesses((prev) => {
        const next = [...prev, item]
        saveGuesses(gameKey, dateKey, next)
        setLatestIndex(next.length - 1)
        return next
      })
    } catch {
      // Swallow — user can try again
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="app-viewport flex flex-col">
      <GameHeader title={title} />
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {gameOver && (
          <div
            className={
              won
                ? "mx-4 mt-3 rounded-md border border-success-500 bg-success-500/20 dark:bg-success-600/30 px-3 py-2 text-sm text-success-600 dark:text-success-500 text-center font-semibold"
                : "mx-4 mt-3 rounded-md border border-primary-300 dark:border-primary-600 bg-primary-100 dark:bg-primary-800 px-3 py-2 text-sm text-primary-700 dark:text-primary-100 text-center font-semibold"
            }
          >
            {won
              ? `Got it in ${guesses.length} ${guesses.length === 1 ? "try" : "tries"} — ${nameOf(answer)}`
              : `Out of guesses. The answer was ${nameOf(answer)}.`}
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
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
    </div>
  )
}
