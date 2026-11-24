import { plots } from "@stardle/data/plotdle"
import type { PlotdlePlot } from "@stardle/types"
import { GAME_LAUNCH_DATES, puzzleNumber } from "@/shared/lib/date"

/**
 * Plotdle's pool is split in two:
 * - "daily" plots are released one per day, in id order. Day N (counted
 *   from the launch date) is the Nth daily plot. Everyone gets the same
 *   plot on the same calendar date because the order is fixed and append-only.
 * - "arcade" plots are always playable from Play Again.
 * Once a daily's day has passed it joins the arcade rotation, so Play Again
 * never spoils today's or a future daily.
 *
 * When the daily plots run out, the schedule carries on through the
 * well-known arcade plots (in id order, so it stays append-only) instead of
 * starting over. Those plots stay in Play Again until they are close to
 * their day, then sit out until it has passed.
 */

const GAME_KEY = "plotdle"
/** How many days ahead an extension plot leaves Play Again and shared links. */
const SPOILER_WINDOW_DAYS = 60

/** Most entries Play Again serves from one franchise. */
const PER_FRANCHISE = 2
/** How much more often household names come up than other well-known films. */
const FAME_WEIGHT = { 1: 0, 2: 1, 3: 3 } as const

export const byId = new Map(plots.map((p) => [p.id, p]))

/**
 * Plots Play Again may ever serve: no MCU, nothing niche, and only the two
 * best-known entries of each franchise (earliest wins a tie).
 */
const arcadeEligible: Set<number> = (() => {
  const fameOf = (p: PlotdlePlot) => p.fame ?? 2
  // Library plots are lookup-only and never served.
  const ok = plots.filter((p) => p.pool !== "library" && !p.mcu && fameOf(p) > 1)
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

const dailies = plots.filter((p) => p.pool === "daily").sort((a, b) => a.id - b.id)
const extension = plots
  .filter((p) => p.pool === "arcade" && arcadeEligible.has(p.id))
  .sort((a, b) => a.id - b.id)
const schedule = [...dailies, ...extension]
const dayOf = new Map(schedule.map((p, i) => [p.id, i + 1]))

/** Today's day number (launch day is 1). */
export function currentDay(dateKey: string): number {
  return puzzleNumber(GAME_KEY, dateKey) ?? 1
}

/** The daily for a date. Only wraps around if the whole extended schedule is used up. */
export function dailyPlot(dateKey: string): PlotdlePlot {
  const n = schedule.length
  const idx = (((currentDay(dateKey) - 1) % n) + n) % n
  return schedule[idx] as PlotdlePlot
}

/** Day a plot is scheduled for, or undefined if it never is. */
function scheduledDay(plot: PlotdlePlot, dateKey: string): number | undefined {
  const day = dayOf.get(plot.id)
  if (day === undefined) return undefined
  // Past the end of the schedule every plot has been released already.
  return currentDay(dateKey) > schedule.length ? 0 : day
}

/** An arcade plot whose daily is far enough off that it's fine to play now. */
function farOffExtension(plot: PlotdlePlot, day: number, today: number): boolean {
  return plot.pool === "arcade" && day > today + SPOILER_WINDOW_DAYS
}

/**
 * Whether a shared link may open this plot. Dailies unlock one day early so a
 * link sent from a time zone that is already on tomorrow still opens.
 */
export function canOpen(plot: PlotdlePlot, dateKey: string): boolean {
  const day = scheduledDay(plot, dateKey)
  const today = currentDay(dateKey)
  return day === undefined || day <= today + 1 || farOffExtension(plot, day, today)
}

/** Daily puzzle number a plot is scheduled for, or undefined if it never is. */
export function dailyNumberOf(plot: PlotdlePlot): number | undefined {
  return dayOf.get(plot.id)
}

/** Why Play Again never serves a plot, or undefined if it can. */
export function playAgainExclusion(plot: PlotdlePlot): string | undefined {
  if (arcadeEligible.has(plot.id)) return undefined
  if (plot.pool === "library") return "Library only"
  if (plot.mcu) return "MCU"
  if ((plot.fame ?? 2) === 1) return "Niche"
  return "Franchise limit"
}

/**
 * Plots Play Again may serve today: eligible plots that aren't scheduled,
 * whose day has passed, or (extension plots) whose day is still far off.
 */
function arcadeCandidates(dateKey: string): PlotdlePlot[] {
  const today = currentDay(dateKey)
  return plots.filter((p) => {
    if (!arcadeEligible.has(p.id)) return false
    const day = scheduledDay(p, dateKey)
    return day === undefined || day < today || farOffExtension(p, day, today)
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

/** The past day (YYYY-MM-DD) a plot was the daily, or undefined if it isn't a past daily. */
export function pastDailyDate(plot: PlotdlePlot, today: string): string | undefined {
  const day = dayOf.get(plot.id)
  const launch = GAME_LAUNCH_DATES[GAME_KEY]
  if (day === undefined || !launch) return undefined
  const [y, m, d] = launch.split("-").map(Number) as [number, number, number]
  const date = new Date(Date.UTC(y, m - 1, d + day - 1)).toISOString().slice(0, 10)
  return date < today ? date : undefined
}
