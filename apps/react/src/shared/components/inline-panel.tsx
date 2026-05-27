import clsx from "clsx"
import { type ReactNode, useEffect } from "react"

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Absolutely positioned crossfade panel meant to sit inside a
 * `relative overflow-hidden` container next to a sibling menu/board
 * panel. Animates by opacity + small translateY when `open` flips.
 */
export function InlinePanel({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <div
      aria-hidden={!open}
      className={clsx(
        "crossfade-panel absolute inset-0 flex flex-col px-3",
        open ? "crossfade-active" : "crossfade-inactive",
      )}
    >
      <header className="flex items-center justify-between pb-3">
        <h2 className="fa5-title text-2xl uppercase text-primary-900 dark:text-primary-50">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-primary-200/80 dark:text-primary-100 dark:hover:bg-primary-700/80"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </header>
      <div className="flex-1 overflow-auto pb-4">{children}</div>
    </div>
  )
}
