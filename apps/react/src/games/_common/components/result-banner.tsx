import clsx from "clsx"
import type { ReactNode } from "react"

interface Props {
  won: boolean
  answer: ReactNode
  guessCount: number
  lossMessage?: string
  /** Optional control pinned to the banner's top-right corner. */
  action?: ReactNode
  /** Extra line under the result, e.g. the next-puzzle countdown. */
  footer?: ReactNode
}

export function ResultBanner({
  won,
  answer,
  guessCount,
  lossMessage = "Better luck next time!",
  action,
  footer,
}: Props) {
  const statusColor = won
    ? "text-success-700 dark:text-success-400"
    : "text-danger-600 dark:text-danger-500"
  const answerColor = won
    ? "text-success-700 dark:text-success-300"
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
      {action && <div className="absolute top-1 right-1">{action}</div>}
      <span className="ticket-stamp" data-result={won ? "win" : "loss"} aria-hidden="true">
        {won ? "Admitted" : "No entry"}
      </span>
      <div className={clsx("text-[11px] uppercase tracking-[0.2em]", statusColor)}>
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
      {footer && <div className="mt-1">{footer}</div>}
    </div>
  )
}
