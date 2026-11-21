import { Link } from "react-router-dom"
import { formatSerial } from "@/shared/lib/date"
import { computeStatsSummary, loadStats } from "@/shared/lib/stats"

interface Props {
  title: string
  onOpenStats: () => void
  mode?: "daily" | "arcade"
  /** Puzzle number shown as the ticket serial (zero-padded to 5 digits). */
  serial?: number
  /** Stats key; the Row field shows this game's current daily streak. */
  gameKey?: string
  /** Guesses used so far, printed as the Seat field. */
  seat?: { used: number; max: number }
}

export function GameHeader({ title, onOpenStats, mode = "daily", serial, gameKey, seat }: Props) {
  const streak = gameKey ? computeStatsSummary(loadStats(gameKey)).currentStreak : undefined
  return (
    <header className="ticket-header-rule relative flex min-h-20 items-stretch pt-3 text-center">
      <Link
        to="/"
        aria-label="Back to menu"
        title="Back"
        className="ml-6 flex h-11 w-11 shrink-0 self-center items-center justify-center rounded-md text-[1.25rem] leading-none text-danger-600 transition-colors hover:bg-danger-600/20 dark:text-primary-50 dark:hover:bg-danger-500/25"
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </Link>
      <div className="flex flex-1 flex-col items-center justify-center px-2">
        <h1 className="fa5-title text-3xl uppercase text-danger-600 dark:text-primary-50">
          {title}
        </h1>
        {/* Printed ticket fields: date, showing and ticket number. */}
        <dl className="ticket-fields mt-1">
          <div>
            <dt>Date</dt>
            <dd>{formatTicketDate()}</dd>
          </div>
          {streak !== undefined && (
            <div title="Current daily streak">
              <dt>Row</dt>
              <dd>{streak}</dd>
            </div>
          )}
          {seat && (
            <div title="Guesses used">
              <dt>Seat</dt>
              <dd>
                {seat.used}/{seat.max}
              </dd>
            </div>
          )}
          <div>
            <dt>{mode === "arcade" ? "Arcade" : "Daily"}</dt>
            <dd className="ticket-serial">
              {serial !== undefined ? `№ ${formatSerial(serial)}` : "Free"}
            </dd>
          </div>
        </dl>
      </div>
      <button
        type="button"
        onClick={onOpenStats}
        aria-label="Stats"
        title="Stats"
        className="mr-6 flex h-11 w-11 shrink-0 cursor-pointer self-center items-center justify-center rounded-md text-[1.25rem] text-danger-600 transition-colors hover:bg-danger-600/20 dark:text-primary-50 dark:hover:bg-danger-500/25"
      >
        <i className="fa-solid fa-chart-column" aria-hidden="true" />
      </button>
    </header>
  )
}

/** "Nov 21" — short enough for the ticket's date field. */
function formatTicketDate(now = new Date()): string {
  return now.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
