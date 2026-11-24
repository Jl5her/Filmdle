import clsx from "clsx"
import { type ReactNode, useEffect } from "react"

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Extra classes, e.g. padding to match the container the panel overlays. */
  className?: string
  /**
   * Buttons for the bottom ticket stub. When set, the panel fills the whole
   * ticket: its content scrolls in the main area and these sit in the stub
   * where the game's own controls normally are (and the corner × is dropped).
   */
  footer?: ReactNode
  /** Hide the corner x (the close button lives in the stub instead). */
  hideClose?: boolean
}

/**
 * Absolutely positioned crossfade panel meant to sit inside a
 * `relative overflow-hidden` container next to a sibling menu/board
 * panel. Animates by opacity + small translateY when `open` flips.
 * The content underneath is only faded out, never unmounted, so a game
 * keeps its state while a panel is open.
 */
export function InlinePanel({
  open,
  title,
  onClose,
  children,
  className,
  footer,
  hideClose,
}: Props) {
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
      inert={!open}
      className={clsx(
        "crossfade-panel absolute inset-0 flex flex-col",
        open ? "crossfade-active" : "crossfade-inactive",
        className,
      )}
    >
      <header className="flex min-h-9 items-center justify-between pb-3">
        <h2 className="fa5-title text-2xl uppercase text-primary-900 dark:text-primary-50">
          {title}
        </h2>
        {!footer && !hideClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-primary-200/80 dark:text-primary-100 dark:hover:bg-primary-700/80"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
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
        )}
      </header>
      <div className="scroll-fade min-h-0 flex-1 overflow-auto pb-4">{children}</div>
      {footer && (
        <div className="ticket-stub flex h-[var(--tear-height)] shrink-0 items-center justify-center gap-3 px-3">
          {footer}
        </div>
      )}
    </div>
  )
}

/** The main call-to-action button in a ticket stub (same look as Play Again). */
export function StubButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex max-w-xs flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-danger-600 px-6 py-3 uppercase tracking-wide text-primary-50 transition-colors hover:bg-danger-700 dark:bg-danger-500 dark:hover:bg-danger-600"
    >
      {children}
    </button>
  )
}
