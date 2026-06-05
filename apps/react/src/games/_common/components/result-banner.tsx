import clsx from "clsx"
import type { ReactNode } from "react"

interface Props {
  won: boolean
  answer: ReactNode
  guessCount: number
  lossMessage?: string
}

export function ResultBanner({
  won,
  answer,
  guessCount,
  lossMessage = "Better luck next time!",
}: Props) {
  const statusColor = won ? "text-success-500" : "text-danger-500"
  const answerColor = won
    ? "text-success-700 dark:text-success-500"
    : "text-primary-900 dark:text-primary-50"

  return (
    <div
      className={clsx(
        "relative shrink-0 px-4 py-2 text-center border-y-2 rounded-md",
        won
          ? "bg-success-500/15 dark:bg-success-500/20 border-success-500/60"
          : "bg-danger-500/15 dark:bg-danger-500/25 border-danger-500/60",
      )}
    >
      <div className={clsx("text-[10px] uppercase tracking-[0.2em]", statusColor)}>
        {won ? "Correct" : "Game Over"}
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <div className={clsx("text-xl uppercase tracking-tight", answerColor)}>{answer}</div>
      </div>
      <div className={clsx("text-xs uppercase mt-1", statusColor)}>
        {won
          ? `You got it in ${guessCount} ${guessCount === 1 ? "guess" : "guesses"}`
          : lossMessage}
      </div>
    </div>
  )
}
