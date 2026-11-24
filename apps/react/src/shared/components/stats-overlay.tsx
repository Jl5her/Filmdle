import type { GameResult } from "@stardle/types"
import clsx from "clsx"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { formatSerial, puzzleNumber, todayKey } from "@/shared/lib/date"
import { computeStatsSummary, loadStats } from "@/shared/lib/stats"
import { CountUp } from "./count-up"

const GAMES = [
  { id: "actordle", label: "Actordle", maxGuesses: 6 },
  { id: "filmdle", label: "Filmdle", maxGuesses: 6 },
  { id: "creditdle", label: "Creditdle", maxGuesses: 6 },
  { id: "showdle", label: "Showdle", maxGuesses: 6 },
  { id: "plotdle", label: "Plotdle", maxGuesses: 3 },
] as const

type GameId = (typeof GAMES)[number]["id"]

interface Props {
  open: boolean
  defaultGame?: GameId
  /** Shown above the stats, e.g. the finished game's Share button. */
  action?: ReactNode
}

export function StatsContent({ open, defaultGame, action }: Props) {
  const [activeGame, setActiveGame] = useState<GameId>(defaultGame ?? "actordle")
  const [version, setVersion] = useState(0)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  // The tab row scrolls on narrow screens; keep the selected game visible.
  useEffect(() => {
    if (open) activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [open, activeGame])

  useEffect(() => {
    if (open) setVersion((v) => v + 1)
  }, [open])

  const activeGameConfig = GAMES.find((g) => g.id === activeGame)!
  const results = useMemo(
    () => (open ? loadStats(activeGame) : []),
    // `version` re-reads storage each time the panel opens.
    [open, activeGame, version],
  )
  const summary = useMemo(() => {
    if (!open) return null
    return computeStatsSummary(results, activeGameConfig.maxGuesses)
  }, [open, results, activeGameConfig.maxGuesses])

  if (!summary) return null

  const maxBar = Math.max(1, ...summary.distribution)
  // Today's daily win gets its bar highlighted in the distribution.
  const today = results.find((r) => r.dateKey === todayKey() && !r.archive)
  const todayGuesses = today?.outcome === "win" ? today.guessCount : undefined

  return (
    <>
      <div
        role="tablist"
        className="mb-5 grid grid-cols-5 gap-0.5 rounded-md bg-primary-100 p-1 dark:bg-primary-900"
      >
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            ref={activeGame === g.id ? activeTabRef : undefined}
            role="tab"
            aria-selected={activeGame === g.id}
            onClick={() => setActiveGame(g.id)}
            className={clsx(
              "marquee min-w-0 cursor-pointer whitespace-nowrap rounded-md px-0.5 py-1.5 text-[clamp(10px,3vw,14px)] tracking-[0.03em] uppercase transition-colors",
              activeGame === g.id
                ? "bg-primary-50 text-primary-900 shadow-sm dark:bg-primary-700 dark:text-primary-50"
                : "text-primary-500 hover:text-primary-900 dark:text-primary-300 dark:hover:text-primary-50",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {action && <div className="mb-5 flex justify-center gap-3">{action}</div>}

      {summary.played === 0 ? (
        <p className="py-8 text-center text-sm text-primary-500 dark:text-primary-300">
          No games played yet. Play today's daily to start tracking stats.
        </p>
      ) : (
        <>
          <section className="mb-5 grid grid-cols-4 gap-2 text-center">
            <Stat key={`${activeGame}-p`} value={summary.played} label="Played" />
            <Stat key={`${activeGame}-w`} value={summary.winRate} suffix="%" label="Win %" />
            <Stat key={`${activeGame}-s`} value={summary.currentStreak} label="Streak" />
            <Stat key={`${activeGame}-m`} value={summary.maxStreak} label="Max" />
          </section>

          <section>
            <h3 className="marquee mb-2 text-base uppercase text-primary-600 dark:text-primary-300">
              Guess Distribution
            </h3>
            <div className="flex flex-col gap-1.5">
              {summary.distribution.map((count, i) => (
                <DistributionBar
                  key={`${activeGame}-${i}`}
                  guess={i + 1}
                  count={count}
                  max={maxBar}
                  highlight={todayGuesses === i + 1}
                />
              ))}
            </div>
          </section>

          <StubCollection
            gameKey={activeGame}
            results={results}
            maxGuesses={activeGameConfig.maxGuesses}
          />
        </>
      )}
    </>
  )
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div>
      <div className="text-2xl leading-none text-primary-900 dark:text-primary-50">
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-primary-500 dark:text-primary-300">
        {label}
      </div>
    </div>
  )
}

function DistributionBar({
  guess,
  count,
  max,
  highlight,
}: {
  guess: number
  count: number
  max: number
  highlight: boolean
}) {
  const widthPct = count > 0 ? Math.max(8, (count / max) * 100) : 8
  // Bars grow in from the left when the panel shows.
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 text-xs text-primary-600 dark:text-primary-300">{guess}</span>
      <div className="flex-1 overflow-hidden rounded bg-primary-100 dark:bg-primary-900">
        <div
          style={{ width: grown ? `${widthPct}%` : "8%" }}
          className={clsx(
            "flex h-5 items-center justify-end px-2 text-xs text-primary-50 transition-[width] duration-700 ease-out motion-reduce:transition-none",
            count > 0
              ? highlight
                ? "bg-success-700 font-bold ring-2 ring-success-400 ring-inset"
                : "bg-success-500 dark:bg-success-600"
              : "bg-primary-200 dark:bg-primary-700",
          )}
        >
          {count}
        </div>
      </div>
    </div>
  )
}

/** Every daily played, newest first, kept like saved cinema stubs. */
function StubCollection({
  gameKey,
  results,
  maxGuesses,
}: {
  gameKey: string
  results: GameResult[]
  maxGuesses: number
}) {
  const stubs = [...results].sort((a, b) => b.dateKey.localeCompare(a.dateKey))
  return (
    <section className="mt-5">
      <h3 className="marquee mb-2 text-base uppercase text-primary-600 dark:text-primary-300">
        Ticket Stubs
      </h3>
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        {stubs.map((r) => {
          const n = puzzleNumber(gameKey, r.dateKey)
          const won = r.outcome === "win"
          const [y, m, d] = r.dateKey.split("-").map(Number) as [number, number, number]
          const date = new Date(y, m - 1, d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
          return (
            <li key={r.dateKey} className="mini-stub" data-result={won ? "win" : "loss"}>
              <span className="mini-stub-date">{date}</span>
              <span className="mini-stub-no">№ {n !== undefined ? formatSerial(n) : "—"}</span>
              <span className="mini-stub-score">
                {won ? `${r.guessCount}/${maxGuesses}` : `X/${maxGuesses}`}
              </span>
              <span className="mini-stub-stamp">{won ? "Admitted" : "No entry"}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
