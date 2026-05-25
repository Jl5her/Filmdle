import { useEffect } from "react"

interface Props {
  open: boolean
  onClose: () => void
}

export function HowToPlayOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/40 dark:bg-primary-900/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-primary-50 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-lg p-5 max-w-sm w-full shadow-xl">
        <header className="flex items-center justify-between mb-4">
          <h2 className="fa5-title text-2xl uppercase text-primary-900 dark:text-primary-50">
            How to Play
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close how to play"
            className="text-2xl leading-none text-primary-500 hover:text-primary-900 dark:hover:text-primary-50 transition-colors cursor-pointer"
          >
            ×
          </button>
        </header>

        <ol className="space-y-3 text-sm text-primary-700 dark:text-primary-200 leading-relaxed list-decimal pl-5 marker:text-secondary-500 marker:font-bold">
          <li>
            Pick a mode: <b>Actordle</b> (guess the actor) or <b>Filmdle</b> (guess the movie).
          </li>
          <li>Type any actor or film. Each guess fills a row of attribute tiles.</li>
          <li>
            Tile colors:
            <div className="mt-2 flex flex-wrap gap-2">
              <Swatch className="bg-success-500" label="Correct" />
              <Swatch className="bg-secondary-500" label="Close" />
              <Swatch className="bg-primary-300 dark:bg-primary-600" label="Wrong" />
            </div>
          </li>
          <li>Arrows on number tiles point toward the answer (↑ higher, ↓ lower).</li>
          <li>
            Solve it in <b>5 tries</b>. New puzzles drop daily.
          </li>
        </ol>
      </div>
    </div>
  )
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`inline-block w-4 h-4 rounded ${className}`} aria-hidden="true" />
      {label}
    </span>
  )
}
