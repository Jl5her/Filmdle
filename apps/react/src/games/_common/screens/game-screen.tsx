import clsx from "clsx"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArcadeNextButton } from "@/games/_common/components/arcade-next-button"
import { NextPuzzleCountdown } from "@/games/_common/components/next-puzzle-countdown"
import { ArchiveCalendar } from "@/shared/components/archive-calendar"
import { GameGuidePanel, type GuideGame, useGameGuide } from "@/shared/components/game-guide"
import { InlinePanel, StubButton } from "@/shared/components/inline-panel"
import { ShareTicketButton } from "@/shared/components/share-ticket-button"
import { StatsContent } from "@/shared/components/stats-overlay"
import { TicketDecor } from "@/shared/components/ticket-decor"
import { dailyStatuses, useDailyDate } from "@/shared/lib/archive"
import { pickDaily } from "@/shared/lib/daily-schedule"
import { formatSerial, puzzleNumber, todayKey } from "@/shared/lib/date"
import { loadGuesses, saveGuesses } from "@/shared/lib/game-state"
import { appendResult } from "@/shared/lib/stats"
import { useAutoOpenStats } from "@/shared/lib/use-auto-stats"
import { MOVIE_THEATER_COLORS, useWinConfetti } from "@/shared/lib/use-win-confetti"
import type { GameColumn } from "../columns"
import { GuessGrid } from "../components/guess-grid"
import { GuessInput, type Suggestion } from "../components/guess-input"
import { GameHeader } from "../components/header"
import { ResultBanner } from "../components/result-banner"

const MAX_GUESSES = 6

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

/** Reads the day (today, or a past daily via ?date=) and remounts the game when it changes. */
export function GameScreen<T>(props: Props<T>) {
  const { dateKey, isArchive } = useDailyDate(props.gameKey)
  return <GameScreenBody key={dateKey} {...props} dateKey={dateKey} isArchive={isArchive} />
}

function GameScreenBody<T>({
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
  dateKey,
  isArchive,
}: Props<T> & { dateKey: string; isArchive: boolean }) {
  const navigate = useNavigate()
  const [archiveOpen, setArchiveOpen] = useState(false)
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
      return pickDaily(gameKey, candidates, idOf, dateKey)
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
  const guide = useGameGuide(gameKey as GuideGame)

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
      ...(isArchive ? { archive: true } : {}),
    })
  }, [gameOver, gameKey, dateKey, answer, guesses, won, idOf, mode, isArchive])

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
  const serial = mode === "daily" ? puzzleNumber(gameKey, dateKey) : undefined

  const shareButton = (
    <ShareTicketButton
      ticket={() => ({
        game: title,
        mode,
        serial,
        dateKey: mode === "daily" && isArchive ? dateKey : undefined,
        marks: guesses.map((g) => idOf(g) === idOf(answer)),
        maxGuesses: MAX_GUESSES,
        won,
      })}
    />
  )
  useAutoOpenStats(
    gameOver,
    () => {
      setArchiveOpen(false)
      setStatsOpen(true)
    },
    mode === "daily",
  )

  return (
    <div className="app-viewport flex flex-col" data-game={gameKey}>
      <GameHeader
        title={title}
        mode={mode}
        onOpenStats={() => {
          setArchiveOpen(false)
          if (guide.open) guide.close()
          setStatsOpen((v) => !v)
        }}
        onOpenHelp={() => {
          setStatsOpen(false)
          setArchiveOpen(false)
          guide.toggle()
        }}
        onOpenArchive={() => {
          setStatsOpen(false)
          if (guide.open) guide.close()
          setArchiveOpen((v) => !v)
        }}
        archiveDate={mode === "daily" && isArchive ? dateKey : undefined}
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-[var(--ticket-pad-x)] pt-3">
        <div
          className={clsx(
            "crossfade-panel flex flex-1 flex-col overflow-hidden",
            statsOpen || archiveOpen || guide.open ? "crossfade-inactive" : "crossfade-active",
          )}
        >
          {gameOver && (
            <div className="mb-3">
              <ResultBanner
                won={won}
                answer={nameOf(answer)}
                guessCount={guesses.length}
                footer={
                  mode === "daily" && !isArchive ? <NextPuzzleCountdown game={title} /> : undefined
                }
              />
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col">
            <GuessGrid
              guesses={guesses}
              answer={answer}
              maxGuesses={MAX_GUESSES}
              latestIndex={latestIndex}
              columns={columns}
              nameOf={nameOf}
              onColumnHelp={() => {
                setStatsOpen(false)
                setArchiveOpen(false)
                guide.show()
              }}
            />
          </div>
          <div className="ticket-stub shrink-0 flex flex-col justify-center h-[var(--tear-height)]">
            {gameOver ? (
              <div className="mx-3 flex justify-center gap-3">
                {shareButton}
                <button
                  type="button"
                  onClick={startNextPuzzle}
                  className={clsx(
                    "flex-1 max-w-xs px-6 py-3 rounded-md uppercase tracking-wide transition-colors cursor-pointer",
                    "bg-danger-600 text-primary-50 hover:bg-danger-700",
                    "dark:bg-danger-500 dark:hover:bg-danger-600",
                  )}
                >
                  {nextPuzzleLabel}
                </button>
              </div>
            ) : (
              <>
                {mode === "arcade" && (
                  <p className="mb-0.5 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-primary-500 kb:hidden dark:text-primary-300">
                    Arcade
                    <span aria-hidden="true">·</span>
                    <ArcadeNextButton label="Next puzzle" onClick={startNextPuzzle} />
                  </p>
                )}
                <GuessInput
                  disabled={resolving}
                  guessedKeys={guessedKeys}
                  placeholder={searchPlaceholder}
                  fetchSuggestions={fetchSuggestions}
                  onPick={handlePick}
                />
              </>
            )}
          </div>
        </div>
        <InlinePanel
          open={statsOpen}
          title="Stats"
          onClose={() => setStatsOpen(false)}
          className="px-[var(--ticket-pad-x)] pt-3"
          footer={
            <>
              {gameOver && shareButton}
              <StubButton onClick={() => setStatsOpen(false)}>Back to game</StubButton>
            </>
          }
        >
          <StatsContent open={statsOpen} defaultGame={gameKey as GuideGame} />
        </InlinePanel>
        <InlinePanel
          open={archiveOpen}
          title="Past puzzles"
          onClose={() => setArchiveOpen(false)}
          className="px-[var(--ticket-pad-x)] pt-3"
          footer={<StubButton onClick={() => setArchiveOpen(false)}>Back to game</StubButton>}
        >
          {archiveOpen && (
            <ArchiveCalendar
              gameKey={gameKey}
              selected={dateKey}
              statusOf={dailyStatuses(gameKey)}
              onPick={(d) => {
                setArchiveOpen(false)
                navigate(d === todayKey() ? `/${gameKey}` : `/${gameKey}?date=${d}`)
              }}
            />
          )}
        </InlinePanel>
        <GameGuidePanel game={gameKey as GuideGame} open={guide.open} onClose={guide.close} />
      </div>
      <TicketDecor code={formatSerial(serial ?? 0)} torn={gameOver} />
    </div>
  )
}
