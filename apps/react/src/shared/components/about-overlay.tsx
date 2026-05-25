import { useEffect } from "react"

interface Props {
  open: boolean
  onClose: () => void
}

export function AboutOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  const buildDate = new Date(__APP_BUILD_DATE__).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/40 dark:bg-primary-900/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-primary-50 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-lg p-5 max-w-sm w-full shadow-xl">
        <header className="flex items-center justify-between mb-4">
          <h2 className="fa5-title text-2xl uppercase text-primary-900 dark:text-primary-50">
            About
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close about"
            className="text-2xl leading-none text-primary-500 hover:text-primary-900 dark:hover:text-primary-50 transition-colors cursor-pointer"
          >
            ×
          </button>
        </header>

        <p className="text-sm text-primary-700 dark:text-primary-200 leading-relaxed">
          Filmdle is a daily film-trivia guessing game. Two modes, one round each per day: guess the
          actor or guess the movie in five tries.
        </p>

        <p className="text-sm text-primary-700 dark:text-primary-200 leading-relaxed mt-3">
          Film and actor data courtesy of{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-secondary-500 underline-offset-2 hover:text-secondary-500"
          >
            TMDB
          </a>
          .
        </p>

        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          <dt className="text-primary-500 dark:text-primary-400 uppercase tracking-wider font-semibold">
            Build
          </dt>
          <dd className="font-mono text-primary-900 dark:text-primary-100">{__APP_COMMIT__}</dd>
          <dt className="text-primary-500 dark:text-primary-400 uppercase tracking-wider font-semibold">
            Released
          </dt>
          <dd className="text-primary-900 dark:text-primary-100">{buildDate}</dd>
        </dl>
      </div>
    </div>
  )
}
