import { useState } from "react"
import { Link } from "react-router-dom"
import { StatsOverlay } from "@/shared/components/stats-overlay"
import { formatLongDate } from "@/shared/lib/date"

interface Props {
  title: string
}

export function GameHeader({ title }: Props) {
  const [statsOpen, setStatsOpen] = useState(false)
  return (
    <header className="relative bg-primary-50 dark:bg-primary-900 px-4 py-3 text-center border-b-2 border-primary-200 dark:border-primary-700">
      <Link
        to="/"
        aria-label="Back to menu"
        title="Back"
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-primary-700 dark:text-primary-50 hover:bg-primary-200 dark:hover:bg-primary-700 rounded transition-colors text-2xl leading-none"
      >
        ‹
      </Link>
      <h1 className="fa5-title text-3xl uppercase text-primary-900 dark:text-primary-50">
        {title}
      </h1>
      <p className="text-[10px] text-primary-500 dark:text-primary-300 mt-0.5">
        {formatLongDate()}
      </p>
      <button
        type="button"
        onClick={() => setStatsOpen(true)}
        aria-label="Stats"
        title="Stats"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-primary-700 dark:text-primary-50 hover:bg-primary-200 dark:hover:bg-primary-700 rounded transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
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
      <StatsOverlay open={statsOpen} onClose={() => setStatsOpen(false)} />
    </header>
  )
}
