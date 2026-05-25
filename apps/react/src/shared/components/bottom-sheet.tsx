import clsx from "clsx"
import { type ReactNode, useEffect, useState } from "react"

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

const EXIT_MS = 220

export function BottomSheet({ open, onClose, title, children }: Props) {
  const [rendered, setRendered] = useState(open)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (open) {
      setRendered(true)
      const t = window.setTimeout(() => setEntered(true), 10)
      return () => window.clearTimeout(t)
    }
    setEntered(false)
    const t = window.setTimeout(() => setRendered(false), EXIT_MS)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!rendered) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end" aria-modal="true" role="dialog">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={clsx(
          "absolute inset-0 cursor-default bg-primary-900/40 backdrop-blur-sm transition-opacity dark:bg-primary-900/70",
          "duration-200 ease-out",
          entered ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={clsx(
          "relative mx-auto w-full max-w-[720px]",
          "bg-primary-50 dark:bg-primary-800",
          "rounded-t-3xl shadow-2xl",
          "border-t border-primary-200 dark:border-primary-700",
          "px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "transition-transform duration-300 ease-out",
          entered ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-primary-300 dark:bg-primary-600"
        />
        {title && (
          <h2 className="fa5-title mb-4 text-2xl uppercase text-primary-900 dark:text-primary-50">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
