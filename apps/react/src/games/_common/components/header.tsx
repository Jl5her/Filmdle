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
    <header className="ticket-header-rule relative z-20 grid min-h-20 grid-cols-[auto_minmax(0,1fr)_auto] content-center items-center px-3 pt-3 pb-1 text-center kb:min-h-0 kb:py-0.5">
      {/* The buttons share the title's row so they centre on it; equal-width
          sides keep the title centred. Back + help on the left, past puzzles
          + stats on the right. */}
      <div className={sideClass("justify-start")}>
        <Link to="/" aria-label="Back to menu" title="Back" className={BUTTON}>
          <Icon name="chevron-left" />
        </Link>
        {onOpenHelp && (
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="How to play"
            title="How to play"
            className={BUTTON}
          >
            <span aria-hidden="true" className="fa5-title text-[1.35rem] leading-none">
              ?
            </span>
          </button>
        )}
      </div>
      <h1 className="fa5-title min-w-0 px-1 text-3xl uppercase text-danger-600 kb:text-xl dark:text-primary-50">
        {title}
      </h1>
      <div className={sideClass("justify-end")}>
        {onOpenArchive && (
          <button
            type="button"
            onClick={onOpenArchive}
            aria-label="Past puzzles"
            title="Past puzzles"
            className={BUTTON}
          >
            <Icon name="calendar" className="text-[1.1rem]" />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenStats}
          aria-label="Stats"
          title="Stats"
          className={BUTTON}
        >
          <Icon name="chart-column" />
        </button>
      </div>
      {/* Just the day being played, or Arcade for bonus rounds. */}
      <p className="col-start-2 mt-1 text-xs uppercase tracking-[0.2em] text-primary-600 kb:hidden dark:text-primary-300">
        {mode === "arcade" && !archiveDate ? "Arcade" : formatTicketDate(archiveDate)}
      </p>
    </header>
  )
}

/** Header icon button: one size, so every icon lines up and spaces evenly. */
const BUTTON =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-[1.25rem] leading-none text-danger-600 transition-colors hover:bg-danger-600/20 dark:text-primary-50 dark:hover:bg-danger-500/25"

function sideClass(justify: string): string {
  return `flex w-[5.25rem] shrink-0 items-center gap-1 ${justify}`
}

/** "Nov 21": the day being played. */
function formatTicketDate(dateKey?: string): string {
  const day = dateKey ? new Date(`${dateKey}T12:00:00`) : new Date()
  return day.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
