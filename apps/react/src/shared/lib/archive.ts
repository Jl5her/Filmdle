import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { GAME_LAUNCH_DATES, todayKey } from "./date"
import { loadStats } from "./stats"

/**
 * Archive: replaying a past day's daily puzzle. The day comes from a
 * `?date=YYYY-MM-DD` query param. Archive results are saved under that
 * day and count toward played/wins, but never toward streaks.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Whether a date is a past daily that can be replayed (launch day up to yesterday). */
export function isArchiveDate(gameKey: string, dateKey: string, today = todayKey()): boolean {
  const launch = GAME_LAUNCH_DATES[gameKey]
  return DATE_RE.test(dateKey) && !!launch && dateKey >= launch && dateKey < today
}

/** The daily date a game screen should show: `?date=` when it's a valid past day, else today. */
export function useDailyDate(gameKey: string): { dateKey: string; isArchive: boolean } {
  const [params] = useSearchParams()
  const requested = params.get("date")
  return useMemo(() => {
    const today = todayKey()
    if (requested && isArchiveDate(gameKey, requested, today)) {
      return { dateKey: requested, isArchive: true }
    }
    return { dateKey: today, isArchive: false }
  }, [gameKey, requested])
}

export type DayStatus = "won" | "lost" | "started" | null

/** How a day's daily went, for the calendar. */
export function dailyStatuses(
  gameKey: string,
  /** Where a day's in-progress game is saved. Plotdle saves by plot id, not date. */
  stateKeyFor: (dateKey: string) => string = (d) => `filmdle-state:${gameKey}:${d}`,
): (dateKey: string) => DayStatus {
  const results = new Map(loadStats(gameKey).map((r) => [r.dateKey, r.outcome]))
  return (dateKey) => {
    const outcome = results.get(dateKey)
    if (outcome) return outcome === "win" ? "won" : "lost"
    try {
      const raw = localStorage.getItem(stateKeyFor(dateKey))
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const guesses = Array.isArray(parsed) ? parsed : parsed?.guesses
      if (parsed?.gaveUp) return "lost"
      return Array.isArray(guesses) && guesses.length > 0 ? "started" : null
    } catch {
      return null
    }
  }
}
