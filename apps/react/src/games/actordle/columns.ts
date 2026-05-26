import { computeAge } from "@/shared/lib/date"
import type { GameColumn } from "../_common/columns"
import type { ActorGuess } from "./types"

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
      id: "nationality",
      label: "Nationality",
      evaluator: { type: "match", get: (a) => a.nationality },
    },
    {
      id: "decade-of-debut",
      label: "Debut",
      evaluator: {
        type: "comparison",
        get: (a) => (a.debutYear ? Math.floor(a.debutYear / 10) : null),
        closeWithin: 1,
        format: (v) => `${v * 10}s`,
      },
    },
    {
      id: "films-in-common",
      label: "Films",
      evaluator: { type: "shared", getIds: (a) => a.filmIds },
    },
  ]
}
