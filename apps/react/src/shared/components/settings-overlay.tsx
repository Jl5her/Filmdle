import clsx from "clsx"
import { useState } from "react"
import { getIncludeAnimated, setIncludeAnimated } from "@/shared/lib/plotdle-prefs"
import type { Design, Theme } from "@/shared/lib/theme"
import { useTheme } from "@/shared/lib/theme-context"

const OPTIONS: { id: Theme; label: string; description: string }[] = [
  { id: "auto", label: "Auto", description: "Match system" },
  { id: "light", label: "Light", description: "Always light" },
  { id: "dark", label: "Dark", description: "Always dark" },
]

const DESIGNS: { id: Design; label: string; description: string; swatch: string[] }[] = [
  {
    id: "ticket",
    label: "Ticket",
    description: "Vintage ticket stub",
    swatch: ["#faf3e0", "#b9281e", "#2a1810"],
  },
  {
    id: "cinema",
    label: "Cinema",
    description: "Bold marquee lights",
    swatch: ["#3b0710", "#e2ad4c", "#b3122a"],
  },
  {
    id: "modern",
    label: "Modern",
    description: "Clean and minimal",
    swatch: ["#ffffff", "#dc3e42", "#141413"],
  },
]

export function SettingsContent() {
  const { theme, setTheme, design, setDesign } = useTheme()
  const [includeAnimated, setIncludeAnimatedState] = useState(getIncludeAnimated)

  return (
    <>
      <section>
        <h3 className="mb-2 text-xs uppercase tracking-wider text-primary-500 dark:text-primary-300">
          Design
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {DESIGNS.map((option) => {
            const active = option.id === design
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDesign(option.id)}
                className={clsx(
                  "flex cursor-pointer flex-col items-center rounded-md border-2 px-2 py-3 transition-colors",
                  active
                    ? "border-primary-500 bg-primary-500/15 text-primary-900 dark:border-primary-300 dark:bg-primary-300/15 dark:text-primary-50"
                    : "border-primary-200 text-primary-600 hover:border-primary-400 dark:border-primary-700 dark:text-primary-300 dark:hover:border-primary-500",
                )}
              >
                <span className="mb-2 flex" aria-hidden="true">
                  {option.swatch.map((c) => (
                    <span
                      key={c}
                      className="-ml-1 h-5 w-5 rounded-full border-2 border-primary-50 first:ml-0 dark:border-primary-800"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span className="text-sm">{option.label}</span>
                <span className="mt-0.5 text-center text-[11px] text-primary-500 dark:text-primary-300">
                  {option.description}
                </span>
              </button>
            )
          })}
        </div>
      </section>
      <section className="mt-6">
        <h3 className="mb-2 text-xs uppercase tracking-wider text-primary-500 dark:text-primary-300">
          Color mode
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
                    ? "border-primary-500 bg-primary-500/15 text-primary-900 dark:border-primary-300 dark:bg-primary-300/15 dark:text-primary-50"
                    : "border-primary-200 text-primary-600 hover:border-primary-400 dark:border-primary-700 dark:text-primary-300 dark:hover:border-primary-500",
                )}
              >
                <span className="text-sm">{option.label}</span>
                <span className="mt-0.5 text-[11px] text-primary-500 dark:text-primary-300">
                  {option.description}
                </span>
              </button>
            )
          })}
        </div>
      </section>
      <section className="mt-6">
        <h3 className="mb-2 text-xs uppercase tracking-wider text-primary-500 dark:text-primary-300">
          Plotdle
        </h3>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border-2 border-primary-200 px-3 py-2.5 dark:border-primary-700">
          <span className="flex flex-col">
            <span className="text-sm text-primary-900 dark:text-primary-50">
              Include animated films
            </span>
            <span className="text-[11px] text-primary-500 dark:text-primary-300">
              When off, Play Again skips animated movies
            </span>
          </span>
          <input
            type="checkbox"
            checked={includeAnimated}
            onChange={(e) => {
              setIncludeAnimated(e.target.checked)
              setIncludeAnimatedState(e.target.checked)
            }}
            className="h-5 w-5 cursor-pointer accent-danger-600"
          />
        </label>
      </section>
    </>
  )
}
