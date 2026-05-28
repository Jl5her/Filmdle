import { Link } from "react-router-dom"
import { formatLongDate } from "@/shared/lib/date"

interface Props {
  title: string
  onOpenStats: () => void
  mode?: "daily" | "arcade"
}

export function GameHeader({ title, onOpenStats, mode = "daily" }: Props) {
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
        <p className="mt-0.5 flex items-center justify-center gap-2 text-[10px] text-primary-600 dark:text-primary-300">
          {mode === "arcade" ? (
            <span className="uppercase tracking-wider text-primary-700 dark:text-primary-200">
              Arcade
            </span>
          ) : (
            <span>{formatLongDate()}</span>
          )}
          <span className="ticket-serial">·</span>
          <span className="ticket-barcode" aria-hidden="true" />
          <span className="ticket-serial">№ 12345</span>
        </p>
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
