import type { EvaluatedCell } from "@stardle/types"

export type ColumnEvaluator<T> =
  | { type: "match"; get: (item: T) => string | null }
  | {
      type: "comparison"
      get: (item: T) => number | null
      closeWithin: number
      format?: (value: number) => string
    }
  | {
      /** Exact match on the main value is green; sharing any tag is yellow. */
      type: "tags"
      get: (item: T) => string | null
      getTags: (item: T) => string[]
    }
  | {
      type: "shared"
      getIds: (item: T) => string[] | null
      format?: (count: number) => string
    }

export interface GameColumn<T> {
  id: string
  label: string
  description?: string
  evaluator: ColumnEvaluator<T>
}

export function evaluateColumn<T>(guess: T, answer: T, column: GameColumn<T>): EvaluatedCell {
  const ev = column.evaluator
  if (ev.type === "match") {
    const g = ev.get(guess)
    const a = ev.get(answer)
    if (g === null) return { value: "?", status: "unknown" }
    return { value: g, status: g === a ? "correct" : "incorrect" }
  }
  if (ev.type === "comparison") {
    const g = ev.get(guess)
    const a = ev.get(answer)
    if (g === null) return { value: "?", status: "unknown" }
    const display = ev.format ? ev.format(g) : String(g)
    if (a === null || g === a) {
      return { value: display, status: a === null ? "incorrect" : "correct" }
    }
    const diff = g - a
    const arrow = diff > 0 ? "↓" : "↑"
    const status = Math.abs(diff) <= ev.closeWithin ? "close" : "incorrect"
    return { value: display, status, arrow }
  }

  if (ev.type === "tags") {
    const g = ev.get(guess)
    const a = ev.get(answer)
    if (g === null) return { value: "?", status: "unknown" }
    if (g === a) return { value: g, status: "correct" }
    const answerTags = new Set(ev.getTags(answer))
    const shared = ev.getTags(guess).some((t) => answerTags.has(t))
    return { value: g, status: shared ? "close" : "incorrect" }
  }

  const gIds = ev.getIds(guess)
  const aIds = ev.getIds(answer)
  if (gIds === null || aIds === null) return { value: "?", status: "unknown" }
  const answerSet = new Set(aIds)
  let count = 0
  for (const id of gIds) if (answerSet.has(id)) count += 1
  const display = ev.format ? ev.format(count) : String(count)
  if (count === aIds.length && count === gIds.length && count > 0) {
    return { value: display, status: "correct" }
  }
  if (count > 0) return { value: display, status: "close" }
  return { value: display, status: "incorrect" }
}
