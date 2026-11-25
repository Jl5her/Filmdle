import { Link } from "react-router-dom"
import { Icon } from "@/shared/components/icon"

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
  collapsed = false,
}: Props) {
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
        {/* Just the day being played, or Arcade for bonus rounds. */}
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary-600 kb:hidden dark:text-primary-300">
          {mode === "arcade" && !archiveDate ? "Arcade" : formatTicketDate(archiveDate)}
        </p>
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

/** "Nov 21": the day being played. */
function formatTicketDate(dateKey?: string): string {
  const day = dateKey ? new Date(`${dateKey}T12:00:00`) : new Date()
  return day.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
