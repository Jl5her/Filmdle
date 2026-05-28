const PREFIX = "filmdle-howto-seen"

function flagKey(gameKey: string): string {
  return `${PREFIX}:${gameKey}`
}

export function hasSeenHowToPlay(gameKey: string): boolean {
  try {
    return localStorage.getItem(flagKey(gameKey)) === "1"
  } catch {
    return true
  }
}

export function markHowToPlaySeen(gameKey: string): void {
  try {
    localStorage.setItem(flagKey(gameKey), "1")
  } catch {
    // localStorage full / blocked / private mode — ignore
  }
}
