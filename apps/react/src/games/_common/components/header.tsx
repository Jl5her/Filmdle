import { Link } from "react-router-dom"
import { formatLongDate } from "@/shared/lib/date"

interface Props {
  title: string
  onOpenStats: () => void
  onOpenHowToPlay: () => void
  mode?: "daily" | "arcade"
}

const sideButtonClass =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-danger-600 transition-colors hover:bg-primary-200/60 dark:text-primary-50 dark:hover:bg-primary-700/60"

export function GameHeader({ title, onOpenStats, onOpenHowToPlay, mode = "daily" }: Props) {
  return (
    <header className="ticket-header-rule relative flex flex-col items-center justify-center gap-1.5 px-4 pt-3 pb-1 text-center">
      <Link
        to="/"
        aria-label="Back to menu"
        title="Back"
        className={`absolute left-3 top-1/2 -translate-y-1/2 ${sideButtonClass}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 6 9 12 15 18" />
        </svg>
      </Link>
      <h1 className="fa5-title text-3xl leading-none uppercase text-danger-600 dark:text-primary-50">
        {title}
      </h1>
      <p className="flex items-center justify-center gap-2 text-[10px] leading-none text-primary-600 dark:text-primary-300">
        {mode === "arcade" ? (
          <span className="font-bold uppercase tracking-wider text-primary-700 dark:text-primary-200">
            Arcade
          </span>
        ) : (
          <span>{formatLongDate()}</span>
        )}
        <span className="ticket-serial">·</span>
        <span className="ticket-barcode" aria-hidden="true" />
        <span className="ticket-serial">№ 12345</span>
      </p>
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
        <button
          type="button"
          onClick={onOpenHowToPlay}
          aria-label="How to play"
          title="How to play"
          className={sideButtonClass}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="11" x2="12" y2="16" />
            <circle cx="12" cy="7.75" r="0.6" fill="currentColor" stroke="none" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onOpenStats}
          aria-label="Stats"
          title="Stats"
          className={sideButtonClass}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="20" x2="4" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="20" y1="20" x2="20" y2="14" />
          </svg>
        </button>
      </div>
    </header>
  )
}
