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
  /** Tapping a column heading opens the how-to-play guide. */
  onColumnHelp?: () => void
}

export function GuessGrid<T>({
  guesses,
  answer,
  maxGuesses,
  latestIndex,
  columns,
  nameOf,
  onColumnHelp,
}: Props<T>) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (latestIndex < 0) return
    const el = rowRefs.current[latestIndex]
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [latestIndex])

  return (
    // The headings sit above the scrolling rows instead of sticking over them,
    // so they need no background of their own and show the ticket's paper.
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 justify-center gap-1 px-2 pt-1 pb-1">
        {columns.map((column) => (
          <button
            type="button"
            key={column.id}
            title={column.description}
            onClick={onColumnHelp}
            disabled={!onColumnHelp}
            aria-label={`${column.label}: how this column works`}
            className={`column-header grid-cell-width text-center uppercase leading-tight [overflow-wrap:normal] [hyphens:none] text-primary-700 dark:text-primary-50${
              onColumnHelp
                ? " cursor-help underline decoration-dotted decoration-primary-400 underline-offset-2"
                : ""
            }`}
          >
            {column.label}
          </button>
        ))}
      </div>
      <div className="scroll-fade min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4 [scrollbar-gutter:stable_both-edges]">
        <div className="flex flex-col items-center gap-1 px-2 pt-1 pb-1">
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
                {/* Placeholder for the guess-name label — keeps the empty
                row's vertical footprint identical to a filled row so
                the grid doesn't reflow when a guess is added. */}
                <div className="guess-name px-2 py-1 text-center uppercase">&nbsp;</div>
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
      </div>
    </div>
  )
}
