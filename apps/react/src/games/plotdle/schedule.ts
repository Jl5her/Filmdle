import { plots } from "@stardle/data/plotdle"
import type { PlotdlePlot } from "@stardle/types"
import { puzzleNumber } from "@/shared/lib/date"

/**
 * Plotdle's pool is split in two:
 * - "daily" plots are released one per day, in id order. Day N (counted
 *   from the launch date) is the Nth daily plot. Everyone gets the same
 *   plot on the same calendar date because the order is fixed and append-only.
 * - "arcade" plots are always playable from Play Again.
 * Once a daily's day has passed it joins the arcade rotation, so Play Again
 * never spoils today's or a future daily.
 */

const GAME_KEY = "plotdle"

export const byId = new Map(plots.map((p) => [p.id, p]))
const dailies = plots.filter((p) => p.pool === "daily").sort((a, b) => a.id - b.id)
const dayOfDaily = new Map(dailies.map((p, i) => [p.id, i + 1]))

/** Today's day number (launch day is 1). */
export function currentDay(dateKey: string): number {
  return puzzleNumber(GAME_KEY, dateKey) ?? 1
}

/** The daily for a date. If the schedule ever runs out, it wraps around. */
export function dailyPlot(dateKey: string): PlotdlePlot {
  const n = dailies.length
  const idx = (((currentDay(dateKey) - 1) % n) + n) % n
  return dailies[idx] as PlotdlePlot
}

/** Day a daily plot is scheduled for, or undefined for arcade plots. */
function scheduledDay(plot: PlotdlePlot, dateKey: string): number | undefined {
  const day = dayOfDaily.get(plot.id)
  if (day === undefined) return undefined
  // Past the end of the schedule every daily has been released already.
  return currentDay(dateKey) > dailies.length ? 0 : day
}

/**
 * Whether a shared link may open this plot. Dailies unlock one day early so a
 * link sent from a time zone that is already on tomorrow still opens.
 */
export function canOpen(plot: PlotdlePlot, dateKey: string): boolean {
  const day = scheduledDay(plot, dateKey)
  return day === undefined || day <= currentDay(dateKey) + 1
}

/** Most entries Play Again serves from one franchise. */
const PER_FRANCHISE = 2
/** How much more often household names come up than other well-known films. */
const FAME_WEIGHT = { 1: 0, 2: 1, 3: 3 } as const

/**
 * Plots Play Again may ever serve: no MCU, nothing niche, and only the two
 * best-known entries of each franchise (earliest wins a tie).
 */
const arcadeEligible: Set<number> = (() => {
  const fameOf = (p: PlotdlePlot) => p.fame ?? 2
  const ok = plots.filter((p) => !p.mcu && fameOf(p) > 1)
  const kept = new Set<number>()
  const byFranchise = new Map<string, PlotdlePlot[]>()
  for (const p of ok) {
    if (!p.franchise) kept.add(p.id)
    else byFranchise.set(p.franchise, [...(byFranchise.get(p.franchise) ?? []), p])
  }
  for (const entries of byFranchise.values()) {
    const best = entries
      .sort((a, b) => fameOf(b) - fameOf(a) || a.year - b.year)
      .slice(0, PER_FRANCHISE)
    for (const p of best) kept.add(p.id)
  }
  return kept
})()

/** Plots Play Again may serve today: eligible arcade plots plus eligible dailies from earlier days. */
function arcadeCandidates(dateKey: string): PlotdlePlot[] {
  const today = currentDay(dateKey)
  return plots.filter((p) => {
    if (!arcadeEligible.has(p.id)) return false
    const day = scheduledDay(p, dateKey)
    return day === undefined || day < today
  })
}

function weightedPick(from: PlotdlePlot[]): PlotdlePlot | undefined {
  const weight = (p: PlotdlePlot) => FAME_WEIGHT[p.fame ?? 2]
  let r = Math.random() * from.reduce((sum, p) => sum + weight(p), 0)
  for (const p of from) {
    r -= weight(p)
    if (r < 0) return p
  }
  return from.at(-1)
}

/**
 * Pick the next arcade plot: random but favouring household names,
 * preferring ones the player hasn't started, skipping animated films if the
 * player opted out.
 */
export function nextArcadePlot(
  currentId: number,
  dateKey: string,
  includeAnimated: boolean,
  hasPlayed: (id: number) => boolean,
): PlotdlePlot | undefined {
  const pool = arcadeCandidates(dateKey).filter(
    (p) => p.id !== currentId && (includeAnimated || !p.animated),
  )
  const fresh = pool.filter((p) => !hasPlayed(p.id))
  return weightedPick(fresh.length > 0 ? fresh : pool)
}
