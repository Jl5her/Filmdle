import clsx from "clsx"
import { useState } from "react"
import { createBackupCode, restoreBackupCode } from "@/shared/lib/backup"
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
  const { theme, setTheme, design, setDesign, colorblind, setColorblind } = useTheme()
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
          Accessibility
        </h3>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border-2 border-primary-200 px-3 py-2.5 dark:border-primary-700">
          <span className="flex flex-col">
            <span className="text-sm text-primary-900 dark:text-primary-50">Color-blind mode</span>
            <span className="text-[11px] text-primary-500 dark:text-primary-300">
              Blue for correct, orange for close, gray for wrong
            </span>
          </span>
          <span className="flex shrink-0 gap-1" aria-hidden="true">
            <span className="h-4 w-4 rounded bg-success-600" />
            <span className="h-4 w-4 rounded bg-warning-600" />
            <span className="tile-miss h-4 w-4 rounded bg-danger-600" />
          </span>
          <input
            type="checkbox"
            checked={colorblind}
            onChange={(e) => setColorblind(e.target.checked)}
            className="h-5 w-5 cursor-pointer accent-danger-600"
          />
        </label>
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
      <StatsBackup />
    </>
  )
}

/** Copy a backup code of stats and progress, or paste one to restore it. */
function StatsBackup() {
  const [code, setCode] = useState("")
  const [copied, setCopied] = useState<"idle" | "copied" | "manual">("idle")
  const [restoreText, setRestoreText] = useState("")
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function copy() {
    const next = createBackupCode()
    setCode(next)
    try {
      await navigator.clipboard.writeText(next)
      setCopied("copied")
      window.setTimeout(() => setCopied("idle"), 2500)
    } catch {
      // Clipboard blocked: show the code so it can be copied by hand.
      setCopied("manual")
    }
  }

  function restore() {
    try {
      const { games, days } = restoreBackupCode(restoreText)
      setMessage({
        ok: true,
        text:
          games > 0
            ? `Restored stats for ${games} ${games === 1 ? "game" : "games"} (${days} days played).`
            : "Restored your saved progress.",
      })
      setRestoreText("")
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message })
    }
  }

  return (
    <section className="mt-6">
      <h3 className="mb-2 text-xs uppercase tracking-wider text-primary-500 dark:text-primary-300">
        Your stats
      </h3>
      <div className="flex flex-col gap-3 rounded-md border-2 border-primary-200 px-3 py-3 dark:border-primary-700">
        <p className="text-[12px] text-primary-600 dark:text-primary-300">
          Stats and streaks are saved on this device only. Copy a backup code to move them to
          another phone or browser.
        </p>
        <button
          type="button"
          onClick={copy}
          className="cursor-pointer self-start rounded-md border-2 border-danger-600 px-3 py-2 text-sm uppercase tracking-wide text-danger-600 transition-colors hover:bg-danger-600/10 dark:border-danger-500 dark:text-primary-50"
        >
          {copied === "copied" ? "Backup code copied" : "Copy backup code"}
        </button>
        {copied === "manual" && (
          <label className="flex flex-col gap-1 text-[12px] text-primary-600 dark:text-primary-300">
            Copying was blocked. Select this code and copy it:
            <textarea
              readOnly
              value={code}
              rows={3}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-md border border-primary-300 bg-primary-50 p-2 font-mono text-[11px] text-primary-900 dark:border-primary-700 dark:bg-primary-800 dark:text-primary-50"
            />
          </label>
        )}
        <label
          htmlFor="restore-code"
          className="text-[12px] text-primary-600 dark:text-primary-300"
        >
          Restore from a backup code
        </label>
        <div className="flex gap-2">
          <input
            id="restore-code"
            value={restoreText}
            onChange={(e) => {
              setRestoreText(e.target.value)
              setMessage(null)
            }}
            placeholder="Paste code"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-md border-2 border-primary-300 bg-primary-100 px-3 py-2 text-sm text-primary-900 outline-none placeholder:text-primary-500 focus:border-primary-500 dark:border-primary-700 dark:bg-primary-800 dark:text-primary-50"
          />
          <button
            type="button"
            onClick={restore}
            disabled={!restoreText.trim()}
            className="cursor-pointer rounded-md bg-danger-600 px-3 py-2 text-sm uppercase tracking-wide text-primary-50 transition-colors hover:bg-danger-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-danger-500"
          >
            Restore
          </button>
        </div>
        {message && (
          <p
            role="status"
            className={clsx(
              "text-[12px]",
              message.ok
                ? "text-success-700 dark:text-success-400"
                : "text-danger-600 dark:text-danger-400",
            )}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  )
}
