import type { GameResult } from "@stardle/types"
import { daysBetween, todayKey } from "./date"

const STATS_PREFIX = "filmdle-stats"

function statsKey(gameKey: string): string {
  return `${STATS_PREFIX}:${gameKey}`
}

export function loadStats(gameKey: string): GameResult[] {
  try {
    const raw = localStorage.getItem(statsKey(gameKey))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as GameResult[]) : []
  } catch {
    return []
  }
}

export function saveStats(gameKey: string, stats: GameResult[]): void {
  try {
    localStorage.setItem(statsKey(gameKey), JSON.stringify(stats))
  } catch {
    // ignore
  }
}

export function appendResult(gameKey: string, result: GameResult): GameResult[] {
  const existing = loadStats(gameKey)
  if (existing.some((r) => r.dateKey === result.dateKey)) return existing
  const next = [...existing, result]
  saveStats(gameKey, next)
  return next
}

export interface StatsSummary {
  played: number
  wins: number
  winRate: number
  currentStreak: number
  maxStreak: number
  distribution: number[]
}

export function computeStatsSummary(
  stats: GameResult[],
  maxGuesses = 6,
  today: string = todayKey(),
): StatsSummary {
  const played = stats.length
  const wins = stats.filter((r) => r.outcome === "win").length
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0

  const distribution = new Array(maxGuesses).fill(0) as number[]
  for (const r of stats) {
    if (r.outcome === "win" && r.guessCount >= 1 && r.guessCount <= maxGuesses) {
      distribution[r.guessCount - 1] = (distribution[r.guessCount - 1] ?? 0) + 1
    }
  }

  // A streak is wins on consecutive days: a loss or a skipped day ends it.
  // Archive replays never build or break a streak.
  const sorted = stats.filter((r) => !r.archive).sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  let maxStreak = 0
  let running = 0
  let prevKey: string | undefined
  for (const r of sorted) {
    const consecutive = prevKey !== undefined && daysBetween(prevKey, r.dateKey) === 1
    if (r.outcome === "win") {
      running = consecutive ? running + 1 : 1
      if (running > maxStreak) maxStreak = running
    } else {
      running = 0
    }
    prevKey = r.dateKey
  }
  // The current streak survives until today's puzzle is missed: it counts
  // if the last daily played was today or yesterday.
  const last = sorted.at(-1)
  const currentStreak =
    last && last.outcome === "win" && daysBetween(last.dateKey, today) <= 1 ? running : 0

  return { played, wins, winRate, currentStreak, maxStreak, distribution }
}

export function hasPlayedToday(gameKey: string, dateKey: string): boolean {
  return loadStats(gameKey).some((r) => r.dateKey === dateKey)
}
