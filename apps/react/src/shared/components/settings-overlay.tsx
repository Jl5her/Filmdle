import clsx from "clsx"
import { useEffect } from "react"
import type { Theme } from "@/shared/lib/theme"
import { useTheme } from "@/shared/lib/theme-context"

const OPTIONS: { id: Theme; label: string; description: string }[] = [
  { id: "auto", label: "Auto", description: "Match system" },
  { id: "light", label: "Light", description: "Always light" },
  { id: "dark", label: "Dark", description: "Always dark" },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function SettingsOverlay({ open, onClose }: Props) {
  const { theme, setTheme } = useTheme()

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/40 dark:bg-primary-900/70 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-primary-50 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-lg p-5 max-w-xs w-full mx-4 shadow-xl">
        <header className="flex items-center justify-between mb-4">
          <h2 className="fa5-title text-2xl uppercase text-primary-900 dark:text-primary-50">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="text-2xl leading-none text-primary-500 hover:text-primary-900 dark:hover:text-primary-50 transition-colors cursor-pointer"
          >
            ×
          </button>
        </header>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-2 font-semibold">
            Theme
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map((option) => {
              const active = option.id === theme
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={clsx(
                    "flex flex-col items-center px-2 py-3 rounded-md border-2 transition-colors cursor-pointer",
                    active
                      ? "border-secondary-500 bg-secondary-500/15 text-primary-900 dark:text-primary-50"
                      : "border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-300 hover:border-primary-400 dark:hover:border-primary-500",
                  )}
                >
                  <span className="text-sm font-bold">{option.label}</span>
                  <span className="mt-0.5 text-[10px] text-primary-500 dark:text-primary-400">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
