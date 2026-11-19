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

/** Plots Play Again may serve: arcade plots plus dailies from earlier days. */
function arcadeCandidates(dateKey: string): PlotdlePlot[] {
  const today = currentDay(dateKey)
  return plots.filter((p) => {
    const day = scheduledDay(p, dateKey)
    return day === undefined || day < today
  })
}

/**
 * Pick the next arcade plot: random, preferring ones the player hasn't
 * started, skipping animated films if the player opted out.
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
  const from = fresh.length > 0 ? fresh : pool
  return from[Math.floor(Math.random() * from.length)]
}
