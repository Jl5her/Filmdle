import { useEffect, useRef } from "react"
import type { GameColumn } from "../columns"
import { GuessRow } from "./guess-row"

interface Props<T> {
  guesses: T[]
  answer: T
  maxGuesses: number
  latestIndex: number
  columns: GameColumn<T>[]
  nameOf: (item: T) => string
}

export function GuessGrid<T>({
  guesses,
  answer,
  maxGuesses,
  latestIndex,
  columns,
  nameOf,
}: Props<T>) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (latestIndex < 0) return
    const el = rowRefs.current[latestIndex]
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [latestIndex])

  return (
    <div className="flex flex-col items-center gap-1 px-2 pt-1 pb-1">
      <div className="sticky top-0 z-20 flex gap-1 justify-center py-1 bg-primary-50 dark:bg-primary-900">
        {columns.map((column) => (
          <div
            key={column.id}
            className="marquee grid-cell-width text-center text-sm uppercase text-primary-700 dark:text-primary-50"
          >
            {column.label}
          </div>
        ))}
      </div>
      {Array.from({ length: maxGuesses }).map((_, i) => {
        const guess = guesses[i]
        return guess ? (
          <div
            key={`g-${i}`}
            ref={(el) => {
              rowRefs.current[i] = el
            }}
          >
            <GuessRow
              guess={guess}
              answer={answer}
              columns={columns}
              nameOf={nameOf}
              animate={i === latestIndex}
            />
          </div>
        ) : (
          <div
            key={`empty-${i}`}
            ref={(el) => {
              rowRefs.current[i] = el
            }}
          >
            <div className="flex gap-1 justify-center">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="grid-cell-size rounded-md bg-primary-100 border border-primary-200 dark:bg-primary-900 dark:border-primary-700"
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
