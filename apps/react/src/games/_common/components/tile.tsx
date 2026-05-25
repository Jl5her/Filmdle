import type { EvaluatedCell } from "@stardle/types"
import clsx from "clsx"
import { useEffect, useState } from "react"

interface Props {
  cell: EvaluatedCell
  animate?: boolean
  delayIndex?: number
}

export function Tile({ cell, animate, delayIndex = 0 }: Props) {
  const [revealed, setRevealed] = useState(!animate)
  const { value, status, arrow } = cell

  useEffect(() => {
    if (!animate) return
    const revealAt = (delayIndex * 0.07 + 0.15) * 1000
    const timer = setTimeout(() => setRevealed(true), revealAt)
    return () => clearTimeout(timer)
  }, [animate, delayIndex])

  let bgClass: string
  let textClass: string
  let borderClass = "border-primary-300 dark:border-primary-700"
  if (!revealed) {
    bgClass = "bg-primary-200 dark:bg-primary-700"
    textClass = "text-primary-200 dark:text-primary-700"
  } else if (status === "correct") {
    bgClass = "bg-success-500 dark:bg-success-600"
    textClass = "text-primary-50"
  } else if (status === "close") {
    bgClass = "bg-warning-500 dark:bg-warning-600"
    textClass = "text-primary-50"
  } else if (status === "unknown") {
    bgClass = "bg-primary-100 dark:bg-primary-800"
    textClass = "text-primary-500 dark:text-primary-400"
    borderClass = "border-dashed border-primary-300 dark:border-primary-700"
  } else {
    bgClass = "bg-primary-300 dark:bg-primary-800"
    textClass = "text-primary-700 dark:text-primary-100"
  }

  const delayClass = `tile-delay-${Math.min(delayIndex, 5)}`

  return (
    <div
      className={clsx(
        "grid-cell-size flex items-center justify-center rounded-md border font-bold leading-tight transition-colors duration-150 px-1",
        bgClass,
        textClass,
        borderClass,
        animate && "animate-cell-flip",
        animate && delayClass,
      )}
    >
      <span className="grid-cell-text text-center break-words">
        {revealed ? value : ""}
        {revealed && arrow && <span className="ml-1">{arrow}</span>}
      </span>
    </div>
  )
}
