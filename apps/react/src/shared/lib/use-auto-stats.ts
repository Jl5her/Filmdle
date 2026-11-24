import { useEffect, useRef } from "react"

const AUTO_OPEN_DELAY_MS = 1500

/**
 * Opens the stats panel shortly after a game ends, so the result, streak and
 * share button come up without a tap. Only when the game ends while the
 * player is here: reopening an already-finished game doesn't pop it again.
 */
export function useAutoOpenStats(gameOver: boolean, open: () => void, enabled = true) {
  const overAtMount = useRef(gameOver)
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => {
    if (!gameOver) {
      overAtMount.current = false
      return
    }
    if (overAtMount.current || !enabled) return
    const t = setTimeout(() => openRef.current(), AUTO_OPEN_DELAY_MS)
    return () => clearTimeout(t)
  }, [gameOver, enabled])
}
