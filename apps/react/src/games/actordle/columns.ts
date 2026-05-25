import { computeAge } from "@/shared/lib/date"
import type { GameColumn } from "../_common/columns"
import type { ActorGuess } from "./types"

function yesNo(v: boolean | null): string | null {
  if (v === null) return null
  return v ? "Yes" : "No"
}

export function buildActordleColumns(now = new Date()): GameColumn<ActorGuess>[] {
  return [
    {
      id: "gender",
      label: "Gender",
      evaluator: {
        type: "match",
        get: (a) => (a.gender === null ? null : a.gender === "M" ? "Male" : "Female"),
      },
    },
    {
      id: "age",
      label: "Age",
      evaluator: {
        type: "comparison",
        get: (a) => (a.dob ? computeAge(a.dob, now) : null),
        closeWithin: 5,
      },
    },
    {
      id: "oscar",
      label: "Oscar",
      evaluator: { type: "match", get: (a) => yesNo(a.oscarWinner) },
    },
    {
      id: "films-in-common",
      label: "Films",
      evaluator: { type: "shared", getIds: (a) => a.filmIds },
    },
    {
      id: "franchise",
      label: "Franchise",
      evaluator: { type: "match", get: (a) => yesNo(a.franchise) },
    },
  ]
}
