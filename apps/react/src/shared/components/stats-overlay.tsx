import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { computeStatsSummary, loadStats } from "@/shared/lib/stats"

const GAMES = [
  { id: "actordle", label: "Actordle" },
  { id: "filmdle", label: "Filmdle" },
] as const

type GameId = (typeof GAMES)[number]["id"]

interface Props {
  open: boolean
  onClose: () => void
}

export function StatsOverlay({ open, onClose }: Props) {
  const [activeGame, setActiveGame] = useState<GameId>("actordle")
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (open) setVersion((v) => v + 1)
  }, [open])

  const summary = useMemo(() => {
    if (!open) return null
    return computeStatsSummary(loadStats(activeGame))
  }, [open, activeGame, version])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open || !summary) return null

  const maxBar = Math.max(1, ...summary.distribution)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/40 dark:bg-primary-900/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-primary-50 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-lg p-5 max-w-sm w-full shadow-xl">
        <header className="flex items-center justify-between mb-4">
          <h2 className="fa5-title text-2xl uppercase text-primary-900 dark:text-primary-50">
            Stats
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close stats"
            className="text-2xl leading-none text-primary-500 hover:text-primary-900 dark:hover:text-primary-50 transition-colors cursor-pointer"
          >
            ×
          </button>
        </header>

        <div className="grid grid-cols-2 gap-1 mb-5 p-1 rounded-md bg-primary-100 dark:bg-primary-900">
          {GAMES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGame(g.id)}
              className={clsx(
                "marquee py-2 text-base uppercase rounded-md transition-colors cursor-pointer",
                activeGame === g.id
                  ? "bg-primary-50 dark:bg-primary-700 text-primary-900 dark:text-primary-50 shadow-sm"
                  : "text-primary-500 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-50",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        {summary.played === 0 ? (
          <p className="text-center py-8 text-sm text-primary-500 dark:text-primary-400">
            No games played yet. Play today's daily to start tracking stats.
          </p>
        ) : (
          <>
            <section className="grid grid-cols-4 gap-2 mb-5 text-center">
              <Stat value={summary.played} label="Played" />
              <Stat value={`${summary.winRate}%`} label="Win %" />
              <Stat value={summary.currentStreak} label="Streak" />
              <Stat value={summary.maxStreak} label="Max" />
            </section>

            <section>
              <h3 className="marquee text-base uppercase text-primary-600 dark:text-primary-300 mb-2">
                Guess Distribution
              </h3>
              <div className="flex flex-col gap-1.5">
                {summary.distribution.map((count, i) => (
                  <DistributionBar key={i} guess={i + 1} count={count} max={maxBar} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-black text-primary-900 dark:text-primary-50 leading-none">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-primary-500 dark:text-primary-400 mt-1">
        {label}
      </div>
    </div>
  )
}

function DistributionBar({
  guess,
  count,
  max,
}: {
  guess: number
  count: number
  max: number
}) {
  const widthPct = count > 0 ? Math.max(8, (count / max) * 100) : 8
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 text-xs font-bold text-primary-600 dark:text-primary-300">
        {guess}
      </span>
      <div className="flex-1 bg-primary-100 dark:bg-primary-900 rounded overflow-hidden">
        <div
          style={{ width: `${widthPct}%` }}
          className={clsx(
            "h-5 flex items-center justify-end px-2 text-xs font-bold text-primary-50",
            count > 0 ? "bg-success-500 dark:bg-success-600" : "bg-primary-200 dark:bg-primary-700",
          )}
        >
          {count}
        </div>
      </div>
    </div>
  )
}
