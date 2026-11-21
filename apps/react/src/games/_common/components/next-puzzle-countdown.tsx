import { useEffect, useState } from "react"
import { todayKey } from "@/shared/lib/date"

function msUntilMidnight(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return next.getTime() - now.getTime()
}

function format(ms: number): string {
  const mins = Math.ceil(ms / 60_000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/** "Next Plotdle in 4h 12m", counting down to local midnight. */
export function NextPuzzleCountdown({ game }: { game: string }) {
  const [left, setLeft] = useState(msUntilMidnight)
  const [shownOn] = useState(todayKey)

  useEffect(() => {
    const id = window.setInterval(() => setLeft(msUntilMidnight()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  // Midnight passed while the page was open.
  const ready = todayKey() !== shownOn
  return (
    <p className="text-[11px] uppercase tracking-widest text-primary-600 dark:text-primary-300">
      {ready ? (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="cursor-pointer uppercase underline underline-offset-2"
        >
          Today's {game} is ready
        </button>
      ) : (
        <>
          Next {game} in <span className="font-semibold tabular-nums">{format(left)}</span>
        </>
      )}
    </p>
  )
}
