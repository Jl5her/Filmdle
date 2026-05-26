import { actorAnswerPool, actors, filmAnswerPool, films } from "@stardle/data"
import clsx from "clsx"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { todayKey } from "@/shared/lib/date"
import { minHashPick } from "@/shared/lib/hash"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function dateKeyOf(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, "0")
  const d = String(day).padStart(2, "0")
  return `${year}-${m}-${d}`
}

interface DayRow {
  day: number
  dateKey: string
  weekdayShort: string
  filmTitle: string
  actorName: string
}

export default function DebugCalendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [monthIndex, setMonthIndex] = useState(today.getMonth())
  const todayKeyStr = useMemo(() => todayKey(), [])

  const filmCandidates = useMemo(
    () => filmAnswerPool.map((id) => films.find((f) => f.id === id)).filter((f) => Boolean(f)),
    [],
  )
  const actorCandidates = useMemo(
    () => actorAnswerPool.map((id) => actors.find((a) => a.id === id)).filter((a) => Boolean(a)),
    [],
  )

  const rows: DayRow[] = useMemo(() => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const out: DayRow[] = []
    for (let d = 1; d <= daysInMonth; d += 1) {
      const dk = dateKeyOf(year, monthIndex, d)
      const film = minHashPick(
        filmCandidates as NonNullable<(typeof filmCandidates)[number]>[],
        (f) => f.id,
        `filmdle:${dk}`,
      )
      const actor = minHashPick(
        actorCandidates as NonNullable<(typeof actorCandidates)[number]>[],
        (a) => a.id,
        `actordle:${dk}`,
      )
      const weekday = new Date(year, monthIndex, d).toLocaleDateString("en-US", {
        weekday: "short",
      })
      out.push({
        day: d,
        dateKey: dk,
        weekdayShort: weekday,
        filmTitle: film.title,
        actorName: actor.name,
      })
    }
    return out
  }, [year, monthIndex, filmCandidates, actorCandidates])

  function goPrev() {
    if (monthIndex === 0) {
      setMonthIndex(11)
      setYear((y) => y - 1)
    } else {
      setMonthIndex((m) => m - 1)
    }
  }

  function goNext() {
    if (monthIndex === 11) {
      setMonthIndex(0)
      setYear((y) => y + 1)
    } else {
      setMonthIndex((m) => m + 1)
    }
  }

  function goToday() {
    const t = new Date()
    setYear(t.getFullYear())
    setMonthIndex(t.getMonth())
  }

  return (
    <div className="app-viewport flex flex-col">
      <header className="relative border-b-2 border-primary-200/60 px-4 py-3 text-center dark:border-primary-700/60">
        <Link
          to="/"
          aria-label="Back to menu"
          title="Back"
          className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-2xl leading-none text-primary-700 transition-colors hover:bg-primary-200 dark:text-primary-50 dark:hover:bg-primary-700"
        >
          ‹
        </Link>
        <h1 className="fa5-title text-3xl uppercase text-primary-900 dark:text-primary-50">
          Answers
        </h1>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-warning-600 dark:text-warning-500">
          Debug · local only
        </p>
      </header>

      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous month"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-lg text-primary-700 transition-colors hover:bg-primary-200 dark:text-primary-50 dark:hover:bg-primary-700"
        >
          ‹
        </button>
        <div className="flex-1 text-center">
          <div className="marquee text-xl uppercase text-primary-900 dark:text-primary-50">
            {MONTH_NAMES[monthIndex]} {year}
          </div>
          <button
            type="button"
            onClick={goToday}
            className="mt-0.5 cursor-pointer text-[10px] uppercase tracking-wider text-primary-500 transition-colors hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-50"
          >
            Jump to today
          </button>
        </div>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-lg text-primary-700 transition-colors hover:bg-primary-200 dark:text-primary-50 dark:hover:bg-primary-700"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-3 border-b border-primary-200/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-primary-500 dark:border-primary-700/60 dark:text-primary-400">
        <span>Date</span>
        <span>Filmdle</span>
        <span>Actordle</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <ul className="divide-y divide-primary-200/60 dark:divide-primary-700/60">
          {rows.map((row) => {
            const isToday = row.dateKey === todayKeyStr
            return (
              <li
                key={row.dateKey}
                className={clsx(
                  "grid grid-cols-[auto_1fr_1fr] items-center gap-x-3 py-2 text-sm",
                  isToday && "bg-primary-500/10 dark:bg-primary-500/20 -mx-4 px-4 rounded-sm",
                )}
              >
                <div
                  className={clsx(
                    "flex w-14 flex-col items-center leading-tight",
                    isToday
                      ? "text-primary-900 dark:text-primary-50"
                      : "text-primary-600 dark:text-primary-300",
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wider">{row.weekdayShort}</span>
                  <span className="text-lg font-black leading-none">{row.day}</span>
                </div>
                <div className="break-words text-primary-900 dark:text-primary-50">
                  {row.filmTitle}
                </div>
                <div className="break-words text-primary-900 dark:text-primary-50">
                  {row.actorName}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
