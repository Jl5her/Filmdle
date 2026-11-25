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
  /** Opens the past-puzzles calendar. */
  onOpenArchive?: () => void
  /** Day of the puzzle when replaying a past daily (YYYY-MM-DD). */
  archiveDate?: string
  mode?: "daily" | "arcade"
  /** Puzzle number shown as the ticket serial (zero-padded to 5 digits). */
  serial?: number
  /** Stats key; the Streak field shows this game's current daily streak. */
  gameKey?: string
  /** Guesses used so far, printed as the Guesses field. */
  seat?: { used: number; max: number }
  /** Hide the header entirely (a screen short of room while typing). */
  collapsed?: boolean
}

export function GameHeader({
  title,
  onOpenStats,
  onOpenHelp,
  onOpenArchive,
  archiveDate,
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
      {/* Equal-width sides keep the title centred: back + help on the left,
          past puzzles + stats on the right. */}
      <div className="ml-3 flex w-[4.25rem] shrink-0 items-center justify-start gap-1.5 self-start mt-[3px] kb:mt-0 kb:self-center">
        <Link
          to="/"
          aria-label="Back to menu"
          title="Back"
          className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-danger-600/45 bg-primary-50 text-danger-600 transition-colors hover:bg-danger-600/10 dark:border-primary-300/30 dark:bg-primary-800/60 dark:text-primary-50 dark:hover:bg-primary-700 text-[13px] leading-none"
        >
          <Icon name="chevron-left" />
        </Link>
        {onOpenHelp && (
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="How to play"
            title="How to play"
            className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-danger-600/45 bg-primary-50 text-danger-600 transition-colors hover:bg-danger-600/10 dark:border-primary-300/30 dark:bg-primary-800/60 dark:text-primary-50 dark:hover:bg-primary-700"
          >
            <span aria-hidden="true" className="fa5-title text-[17px] leading-none">
              ?
            </span>
          </button>
        )}
      </div>
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
            <span className="tf-value">{formatTicketDate(archiveDate)}</span>
          </span>
          {streak !== undefined && (
            <span className="tf">
              <span className="tf-label">Streak</span>
              <span className="tf-value">{streak}</span>
            </span>
          )}
          {seat && (
            <span className="tf">
              <span className="tf-label">Guesses</span>
              <span className="tf-value">
                {seat.used}/{seat.max}
              </span>
            </span>
          )}
          <span className="tf">
            <span className="tf-label">
              {archiveDate ? "Archive" : mode === "arcade" ? "Arcade" : "Daily"}
            </span>
            <span className="tf-value ticket-serial">
              {serial !== undefined ? `№ ${formatSerial(serial)}` : "Free"}
            </span>
          </span>
        </button>
        {explain && (
          <div id="ticket-fields-help" role="note" className="ticket-fields-help">
            {streak !== undefined && (
              <p>
                <b>Streak</b> daily puzzles won in a row: {streak}
              </p>
            )}
            {seat && (
              <p>
                <b>Guesses</b> used so far: {seat.used} of {seat.max}
              </p>
            )}
            <p>
              <b>{archiveDate ? "Archive" : mode === "arcade" ? "Arcade" : "Daily"}</b>{" "}
              {archiveDate && serial !== undefined
                ? `a past daily, puzzle number ${formatSerial(serial)}. Doesn't affect your streak`
                : serial !== undefined
                  ? `puzzle number ${formatSerial(serial)}`
                  : "a free-play puzzle, not today's daily"}
            </p>
          </div>
        )}
      </div>
      <div className="mr-3 flex w-[4.25rem] shrink-0 items-center justify-end gap-1.5 self-start mt-[3px] kb:mt-0 kb:self-center">
        {onOpenArchive && (
          <button
            type="button"
            onClick={onOpenArchive}
            aria-label="Past puzzles"
            title="Past puzzles"
            className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-danger-600/45 bg-primary-50 text-danger-600 transition-colors hover:bg-danger-600/10 dark:border-primary-300/30 dark:bg-primary-800/60 dark:text-primary-50 dark:hover:bg-primary-700 text-[12px]"
          >
            <Icon name="calendar" />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenStats}
          aria-label="Stats"
          title="Stats"
          className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-danger-600/45 bg-primary-50 text-danger-600 transition-colors hover:bg-danger-600/10 dark:border-primary-300/30 dark:bg-primary-800/60 dark:text-primary-50 dark:hover:bg-primary-700 text-[13px]"
        >
          <Icon name="chart-column" />
        </button>
      </div>
    </header>
  )
}

/** "Nov 21" — short enough for the ticket's date field. */
function formatTicketDate(dateKey?: string): string {
  const day = dateKey ? new Date(`${dateKey}T12:00:00`) : new Date()
  return day.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
