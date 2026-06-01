import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { computeStatsSummary, loadStats } from "@/shared/lib/stats"

const GAMES = [
  { id: "actordle", label: "Actordle" },
  { id: "filmdle", label: "Filmdle" },
  { id: "capcrunch", label: "Cap Crunch" },
] as const

type GameId = (typeof GAMES)[number]["id"]

interface Props {
  open: boolean
}

export function StatsContent({ open }: Props) {
  const [activeGame, setActiveGame] = useState<GameId>("actordle")
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (open) setVersion((v) => v + 1)
  }, [open])

  const summary = useMemo(() => {
    if (!open) return null
    return computeStatsSummary(loadStats(activeGame))
  }, [open, activeGame, version])

  if (!summary) return null

  const maxBar = Math.max(1, ...summary.distribution)

  return (
    <>
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-md bg-primary-100 p-1 dark:bg-primary-900">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActiveGame(g.id)}
            className={clsx(
              "marquee cursor-pointer rounded-md py-2 text-base uppercase transition-colors",
              activeGame === g.id
                ? "bg-primary-50 text-primary-900 shadow-sm dark:bg-primary-700 dark:text-primary-50"
                : "text-primary-500 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-50",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {summary.played === 0 ? (
        <p className="py-8 text-center text-sm text-primary-500 dark:text-primary-400">
          No games played yet. Play today's daily to start tracking stats.
        </p>
      ) : (
        <>
          <section className="mb-5 grid grid-cols-4 gap-2 text-center">
            <Stat value={summary.played} label="Played" />
            <Stat value={`${summary.winRate}%`} label="Win %" />
            <Stat value={summary.currentStreak} label="Streak" />
            <Stat value={summary.maxStreak} label="Max" />
          </section>

          <section>
            <h3 className="marquee mb-2 text-base uppercase text-primary-600 dark:text-primary-300">
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
    </>
  )
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="text-2xl leading-none text-primary-900 dark:text-primary-50">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-primary-500 dark:text-primary-400">
        {label}
      </div>
    </div>
  )
}

function DistributionBar({ guess, count, max }: { guess: number; count: number; max: number }) {
  const widthPct = count > 0 ? Math.max(8, (count / max) * 100) : 8
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 text-xs text-primary-600 dark:text-primary-300">{guess}</span>
      <div className="flex-1 overflow-hidden rounded bg-primary-100 dark:bg-primary-900">
        <div
          style={{ width: `${widthPct}%` }}
          className={clsx(
            "flex h-5 items-center justify-end px-2 text-xs text-primary-50",
            count > 0 ? "bg-success-500 dark:bg-success-600" : "bg-primary-200 dark:bg-primary-700",
          )}
        >
          {count}
        </div>
      </div>
    </div>
  )
}
