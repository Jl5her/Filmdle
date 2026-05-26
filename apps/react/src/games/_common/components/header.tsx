import { Link } from "react-router-dom"
import { formatLongDate } from "@/shared/lib/date"

interface Props {
  title: string
  onOpenStats: () => void
  mode?: "daily" | "arcade"
}

export function GameHeader({ title, onOpenStats, mode = "daily" }: Props) {
  return (
    <header className="relative border-b-2 border-primary-200/60 px-4 py-3 text-center dark:border-primary-700/60">
      <Link
        to="/"
        aria-label="Back to menu"
        title="Back"
        className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-2xl leading-none text-primary-700 transition-colors hover:bg-primary-200 dark:text-primary-50 dark:hover:bg-primary-700"
      >
        ‹
      </Link>
      <h1 className="fa5-title text-3xl uppercase text-primary-900 dark:text-primary-50">
        {title}
      </h1>
      <p className="mt-0.5 text-[10px] text-primary-500 dark:text-primary-300">
        {mode === "arcade" ? (
          <span className="font-bold uppercase tracking-wider text-primary-700 dark:text-primary-200">
            Arcade
          </span>
        ) : (
          formatLongDate()
        )}
      </p>
      <button
        type="button"
        onClick={onOpenStats}
        aria-label="Stats"
        title="Stats"
        className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-primary-700 transition-colors hover:bg-primary-200 dark:text-primary-50 dark:hover:bg-primary-700"
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
    </header>
  )
}
