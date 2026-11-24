import clsx from "clsx"
import { useMemo, useState } from "react"
import type { DayStatus } from "@/shared/lib/archive"
import { GAME_LAUNCH_DATES, todayKey } from "@/shared/lib/date"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

function keyOf(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function monthIndex(dateKey: string): number {
  const [y, m] = dateKey.split("-").map(Number) as [number, number]
  return y * 12 + (m - 1)
}

interface Props {
  gameKey: string
  /** Day currently being played, highlighted in the grid. */
  selected: string
  statusOf: (dateKey: string) => DayStatus
  onPick: (dateKey: string) => void
}

/**
 * Month grid of a game's past dailies. Days from launch to today are
 * playable; each shows whether it was won, lost, started or not played.
 */
export function ArchiveCalendar({ gameKey, selected, statusOf, onPick }: Props) {
  const today = useMemo(() => todayKey(), [])
  const launch = GAME_LAUNCH_DATES[gameKey] ?? today
  const first = monthIndex(launch)
  const last = monthIndex(today)
  const [month, setMonth] = useState(() => Math.min(last, Math.max(first, monthIndex(selected))))

  const year = Math.floor(month / 12)
  const m = month % 12
  const daysInMonth = new Date(year, m + 1, 0).getDate()
  const leading = new Date(year, m, 1).getDay()
  const title = new Date(year, m, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const days = Array.from({ length: daysInMonth }, (_, i) => keyOf(year, m, i + 1))
  const played = days.filter((d) => d >= launch && d <= today && statusOf(d) !== null)

  return (
    <div className="flex flex-col gap-3 text-primary-800 dark:text-primary-100">
      <p className="text-sm text-primary-600 dark:text-primary-300">
        Missed a day? Play any past daily. Archive games count in your stats but not your streak.
      </p>
      <div className="flex items-center justify-between">
        <MonthButton
          label="Previous month"
          disabled={month <= first}
          onClick={() => setMonth(month - 1)}
        >
          ‹
        </MonthButton>
        <div className="text-center">
          <p className="fa5-title text-lg uppercase text-primary-900 dark:text-primary-50">
            {title}
          </p>
          <p className="text-[11px] uppercase tracking-wider text-primary-500 dark:text-primary-300">
            {played.length} played
          </p>
        </div>
        <MonthButton
          label="Next month"
          disabled={month >= last}
          onClick={() => setMonth(month + 1)}
        >
          ›
        </MonthButton>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((w, i) => (
          <span
            key={i}
            className="text-[11px] uppercase tracking-wider text-primary-500 dark:text-primary-300"
          >
            {w}
          </span>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {days.map((d, i) => {
          const playable = d >= launch && d <= today
          const status = playable ? statusOf(d) : null
          const isToday = d === today
          return (
            <button
              key={d}
              type="button"
              disabled={!playable}
              onClick={() => onPick(d)}
              aria-label={`${d}${isToday ? " (today)" : ""}${status ? `, ${status}` : ""}`}
              aria-current={d === selected ? "date" : undefined}
              className={clsx(
                "relative flex aspect-square items-center justify-center rounded-md text-sm transition-colors",
                !playable && "cursor-default text-primary-300 dark:text-primary-600",
                playable && "cursor-pointer",
                status === "won" && "bg-success-600 text-primary-50",
                status === "lost" && "tile-miss bg-danger-600 text-primary-50",
                status === "started" &&
                  "border-2 border-dashed border-warning-600 text-primary-900 dark:text-primary-50",
                playable &&
                  status === null &&
                  "border border-primary-300 hover:bg-primary-200/70 dark:border-primary-600 dark:hover:bg-primary-700",
                d === selected &&
                  "ring-2 ring-primary-900 ring-offset-2 ring-offset-primary-50 dark:ring-primary-50 dark:ring-offset-primary-900",
                isToday && "font-bold",
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-primary-600 dark:text-primary-300">
        <Legend className="bg-success-600">Won</Legend>
        <Legend className="tile-miss bg-danger-600">Lost</Legend>
        <Legend className="border-2 border-dashed border-warning-600">Started</Legend>
        <Legend className="border border-primary-400">Not played</Legend>
      </div>
    </div>
  )
}

function MonthButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-2xl leading-none text-danger-600 transition-colors hover:bg-danger-600/15 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent dark:text-primary-50"
    >
      {children}
    </button>
  )
}

function Legend({ className, children }: { className: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded-sm ${className}`} aria-hidden="true" />
      {children}
    </span>
  )
}
