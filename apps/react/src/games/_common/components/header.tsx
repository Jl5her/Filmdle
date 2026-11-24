import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Icon } from "@/shared/components/icon"
import { formatSerial } from "@/shared/lib/date"
import { computeStatsSummary, loadStats } from "@/shared/lib/stats"

interface Props {
  title: string
  onOpenStats: () => void
  /** Reopens this game's how-to-play guide. */
  onOpenHelp?: () => void
  mode?: "daily" | "arcade"
  /** Puzzle number shown as the ticket serial (zero-padded to 5 digits). */
  serial?: number
  /** Stats key; the Row field shows this game's current daily streak. */
  gameKey?: string
  /** Guesses used so far, printed as the Seat field. */
  seat?: { used: number; max: number }
  /** Hide the header entirely (a screen short of room while typing). */
  collapsed?: boolean
}

export function GameHeader({
  title,
  onOpenStats,
  onOpenHelp,
  mode = "daily",
  serial,
  gameKey,
  seat,
  collapsed = false,
}: Props) {
  const streak = gameKey ? computeStatsSummary(loadStats(gameKey)).currentStreak : undefined
  const [explain, setExplain] = useState(false)

  // Any tap elsewhere closes the explanation.
  useEffect(() => {
    if (!explain) return
    const close = () => setExplain(false)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [explain])
  if (collapsed) return null
  return (
    <header className="ticket-header-rule relative z-20 flex min-h-20 items-stretch pt-3 text-center kb:min-h-0 kb:py-0.5">
      <Link
        to="/"
        aria-label="Back to menu"
        title="Back"
        className="ml-4 flex h-10 w-10 shrink-0 self-center items-center justify-center rounded-md text-[1.25rem] leading-none text-danger-600 transition-colors hover:bg-danger-600/20 dark:text-primary-50 dark:hover:bg-danger-500/25"
      >
        <Icon name="chevron-left" />
      </Link>
      <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center px-1">
        <h1 className="fa5-title text-3xl uppercase text-danger-600 kb:text-xl dark:text-primary-50">
          {title}
        </h1>
        {/* Printed ticket fields. Tapping them explains what each one means. */}
        <button
          type="button"
          className="ticket-fields mt-1 cursor-pointer kb:hidden"
          aria-expanded={explain}
          aria-controls="ticket-fields-help"
          onClick={(e) => {
            e.stopPropagation()
            setExplain((v) => !v)
          }}
        >
          <span className="tf tf-date">
            <span className="tf-label">Date</span>
            <span className="tf-value">{formatTicketDate()}</span>
          </span>
          {streak !== undefined && (
            <span className="tf">
              <span className="tf-label">Row</span>
              <span className="tf-value">{streak}</span>
            </span>
          )}
          {seat && (
            <span className="tf">
              <span className="tf-label">Seat</span>
              <span className="tf-value">
                {seat.used}/{seat.max}
              </span>
            </span>
          )}
          <span className="tf">
            <span className="tf-label">{mode === "arcade" ? "Arcade" : "Daily"}</span>
            <span className="tf-value ticket-serial">
              {serial !== undefined ? `№ ${formatSerial(serial)}` : "Free"}
            </span>
          </span>
        </button>
        {explain && (
          <div id="ticket-fields-help" role="note" className="ticket-fields-help">
            {streak !== undefined && (
              <p>
                <b>Row</b> your daily win streak ({streak} in a row)
              </p>
            )}
            {seat && (
              <p>
                <b>Seat</b> guesses used: {seat.used} of {seat.max}
              </p>
            )}
            <p>
              <b>{mode === "arcade" ? "Arcade" : "Daily"}</b>{" "}
              {serial !== undefined
                ? `puzzle number ${formatSerial(serial)}`
                : "a free-play puzzle, not today's daily"}
            </p>
          </div>
        )}
      </div>
      {onOpenHelp && (
        <button
          type="button"
          onClick={onOpenHelp}
          aria-label="How to play"
          title="How to play"
          className="flex h-10 w-8 shrink-0 cursor-pointer self-center items-center justify-center rounded-md text-[1.25rem] text-danger-600 transition-colors hover:bg-danger-600/20 dark:text-primary-50 dark:hover:bg-danger-500/25"
        >
          <span aria-hidden="true" className="fa5-title text-2xl leading-none">
            ?
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={onOpenStats}
        aria-label="Stats"
        title="Stats"
        className="mr-4 flex h-10 w-10 shrink-0 cursor-pointer self-center items-center justify-center rounded-md text-[1.25rem] text-danger-600 transition-colors hover:bg-danger-600/20 dark:text-primary-50 dark:hover:bg-danger-500/25"
      >
        <Icon name="chart-column" />
      </button>
    </header>
  )
}

/** "Nov 21" — short enough for the ticket's date field. */
function formatTicketDate(now = new Date()): string {
  return now.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
