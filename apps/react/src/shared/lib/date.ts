export function todayKey(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function computeAge(dob: string, now = new Date()): number {
  const [y, m, d] = dob.split("-").map(Number) as [number, number, number]
  let age = now.getFullYear() - y
  const beforeBirthday = now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)
  if (beforeBirthday) age -= 1
  return age
}

export function formatShortDate(now = new Date()): string {
  return now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export function formatLongDate(now = new Date()): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/** Day each game launched. Daily puzzle № 1 is this date; each day after adds one. */
export const GAME_LAUNCH_DATES: Record<string, string> = {
  actordle: "2026-05-25",
  filmdle: "2026-05-25",
  creditdle: "2026-06-06",
  showdle: "2026-06-06",
  plotdle: "2026-11-18",
}

/** Whole days from `fromKey` to `toKey` (YYYY-MM-DD), DST-safe. */
export function daysBetween(fromKey: string, toKey: string): number {
  const toUtc = (k: string) => {
    const [y, m, d] = k.split("-").map(Number) as [number, number, number]
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(toKey) - toUtc(fromKey)) / 86_400_000)
}

/** The daily puzzle number for a game on a date (launch day is 1). */
export function puzzleNumber(gameKey: string, dateKey: string): number | undefined {
  const launch = GAME_LAUNCH_DATES[gameKey]
  return launch ? daysBetween(launch, dateKey) + 1 : undefined
}

/** Fixed-width ticket serial, e.g. 7 → "00007". */
export function formatSerial(n: number): string {
  return String(n).padStart(5, "0")
}
