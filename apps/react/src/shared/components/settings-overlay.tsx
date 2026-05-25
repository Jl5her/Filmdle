import clsx from "clsx"
import type { Theme } from "@/shared/lib/theme"
import { useTheme } from "@/shared/lib/theme-context"
import { BottomSheet } from "./bottom-sheet"

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

  return (
    <BottomSheet open={open} onClose={onClose} title="Settings">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
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
                  "flex cursor-pointer flex-col items-center rounded-md border-2 px-2 py-3 transition-colors",
                  active
                    ? "border-secondary-500 bg-secondary-500/15 text-primary-900 dark:text-primary-50"
                    : "border-primary-200 text-primary-600 hover:border-primary-400 dark:border-primary-700 dark:text-primary-300 dark:hover:border-primary-500",
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
    </BottomSheet>
  )
}
