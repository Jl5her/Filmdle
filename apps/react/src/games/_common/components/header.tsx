import { Link } from "react-router-dom"
import { formatLongDate } from "@/shared/lib/date"

interface Props {
  title: string
}

export function GameHeader({ title }: Props) {
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
      <p className="text-[10px] text-primary-500 dark:text-primary-300 mt-0.5">{formatLongDate()}</p>
    </header>
  )
}
