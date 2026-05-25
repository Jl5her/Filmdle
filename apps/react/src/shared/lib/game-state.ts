const STATE_PREFIX = "filmdle-state"

function stateKey(gameKey: string, dateKey: string): string {
  return `${STATE_PREFIX}:${gameKey}:${dateKey}`
}

export function loadGuesses<T>(gameKey: string, dateKey: string): T[] {
  try {
    const raw = localStorage.getItem(stateKey(gameKey, dateKey))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function saveGuesses<T>(gameKey: string, dateKey: string, guesses: T[]): void {
  try {
    localStorage.setItem(stateKey(gameKey, dateKey), JSON.stringify(guesses))
  } catch {
    // localStorage full / blocked / private mode — ignore
  }
}
