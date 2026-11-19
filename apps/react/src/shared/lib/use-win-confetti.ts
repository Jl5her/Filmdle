import confetti from "canvas-confetti"
import { useEffect, useRef } from "react"

interface Options {
  won: boolean
  /** Colors for the small paper flecks mixed in with the movie shapes. */
  colors: string[]
  dedupKey: string | number | null
  duration?: number
  centerBurst?: boolean
}

// Popcorn is weighted so it dominates; tickets, clappers and stars add variety.
const EMOJI = ["🍿", "🍿", "🍿", "🎟️", "🎬", "⭐"]
const SCALAR = 2.2

let shapeCache: confetti.Shape[] | null = null

/** Emoji shapes are rasterized once, on first win, then reused. */
function movieShapes(): confetti.Shape[] {
  if (!shapeCache) {
    shapeCache = EMOJI.map((text) => confetti.shapeFromText({ text, scalar: SCALAR }))
  }
  return shapeCache
}

/**
 * Win celebration: popcorn pops up out of the bottom of the screen like a
 * kettle, with a few tickets, clappers and stars, and a light sprinkle of
 * colored flecks. Skipped entirely for users who prefer reduced motion.
 */
export function useWinConfetti({
  won,
  colors,
  dedupKey,
  duration = 1500,
  centerBurst = true,
}: Options) {
  const lastKeyRef = useRef<string | number | null>(null)

  useEffect(() => {
    if (!won) return
    if (dedupKey === null) return
    if (lastKeyRef.current === dedupKey) return
    lastKeyRef.current = dedupKey

    const shapes = movieShapes()
    const base = {
      shapes,
      scalar: SCALAR,
      flat: true,
      gravity: 1.1,
      ticks: 220,
      zIndex: 2000,
      disableForReducedMotion: true,
    }
    const end = Date.now() + duration

    // Kernels keep popping from just below the bottom edge for `duration` ms.
    function frame() {
      confetti({
        ...base,
        particleCount: 1,
        angle: 90,
        spread: 50,
        startVelocity: 55 + Math.random() * 15,
        origin: { x: 0.2 + Math.random() * 0.6, y: 1.05 },
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }

    if (centerBurst) {
      confetti({
        ...base,
        particleCount: 18,
        spread: 110,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.35 },
      })
      confetti({
        particleCount: 60,
        spread: 120,
        startVelocity: 40,
        scalar: 0.8,
        origin: { x: 0.5, y: 0.35 },
        colors,
        zIndex: 2000,
        disableForReducedMotion: true,
      })
    }
    frame()
  }, [won, dedupKey, colors, duration, centerBurst])
}

export const MOVIE_THEATER_COLORS = ["#D4AF37", "#C8102E", "#FFFFFF"]
