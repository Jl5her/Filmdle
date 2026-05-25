import type { GameResult } from "@stardle/types"

const STATS_PREFIX = "filmdle-stats"
const MAX_GUESSES = 5

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

export function computeStatsSummary(stats: GameResult[]): StatsSummary {
  const played = stats.length
  const wins = stats.filter((r) => r.outcome === "win").length
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0

  const distribution = new Array(MAX_GUESSES).fill(0) as number[]
  for (const r of stats) {
    if (r.outcome === "win" && r.guessCount >= 1 && r.guessCount <= MAX_GUESSES) {
      distribution[r.guessCount - 1] = (distribution[r.guessCount - 1] ?? 0) + 1
    }
  }

  const sorted = [...stats].sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  let maxStreak = 0
  let running = 0
  for (const r of sorted) {
    if (r.outcome === "win") {
      running += 1
      if (running > maxStreak) maxStreak = running
    } else {
      running = 0
    }
  }
  let currentStreak = 0
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (sorted[i]?.outcome === "win") currentStreak += 1
    else break
  }

  return { played, wins, winRate, currentStreak, maxStreak, distribution }
}

export function hasPlayedToday(gameKey: string, dateKey: string): boolean {
  return loadStats(gameKey).some((r) => r.dateKey === dateKey)
}
