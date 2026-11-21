import type { GameResult } from "@stardle/types"

/**
 * Stats, streaks and game progress live in this browser's storage only.
 * A backup code carries them to another device: every "filmdle-" and
 * "stardle-" key, as base64 JSON behind a version prefix.
 */
const PREFIX = "FILMDLE1:"
const KEY_PATTERN = /^(filmdle|stardle)-/
const STATS_KEY = /^filmdle-stats:/

function readAll(): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !KEY_PATTERN.test(k)) continue
    const v = localStorage.getItem(k)
    if (v !== null) out[k] = v
  }
  return out
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function fromBase64(b64: string): string {
  const bin = atob(b64)
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

/** A code holding everything Filmdle has saved in this browser. */
export function createBackupCode(): string {
  return PREFIX + toBase64(JSON.stringify(readAll()))
}

/** Results from both sides, one per day; the existing one wins a clash. */
function mergeResults(existing: string | null, incoming: string): string {
  const parse = (raw: string | null): GameResult[] => {
    try {
      const v = raw ? JSON.parse(raw) : []
      return Array.isArray(v) ? v : []
    } catch {
      return []
    }
  }
  const byDay = new Map<string, GameResult>()
  for (const r of [...parse(incoming), ...parse(existing)]) byDay.set(r.dateKey, r)
  return JSON.stringify([...byDay.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey)))
}

export interface RestoreResult {
  games: number
  days: number
}

/**
 * Restores a backup code into this browser. Stats are merged day by day
 * (nothing already here is lost); other saved progress fills in only where
 * this browser has none. Throws with a readable message if the code is bad.
 */
export function restoreBackupCode(code: string): RestoreResult {
  const trimmed = code.trim().replace(/\s+/g, "")
  if (!trimmed.startsWith(PREFIX)) throw new Error("That isn't a Filmdle backup code.")
  let data: unknown
  try {
    data = JSON.parse(fromBase64(trimmed.slice(PREFIX.length)))
  } catch {
    throw new Error("That code is incomplete. Copy the whole code and try again.")
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("That code is incomplete. Copy the whole code and try again.")
  }
  let games = 0
  let days = 0
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (!KEY_PATTERN.test(k) || typeof v !== "string") continue
    if (STATS_KEY.test(k)) {
      const merged = mergeResults(localStorage.getItem(k), v)
      localStorage.setItem(k, merged)
      games += 1
      days += (JSON.parse(merged) as unknown[]).length
    } else if (localStorage.getItem(k) === null) {
      localStorage.setItem(k, v)
    }
  }
  return { games, days }
}
