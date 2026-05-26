import { computeAge } from "@/shared/lib/date"
import type { GameColumn } from "../_common/columns"
import type { ActorGuess } from "./types"

export function buildActordleColumns(now = new Date()): GameColumn<ActorGuess>[] {
  return [
    {
      id: "gender",
      label: "Gender",
      description: "Male or Female. Green if it matches the answer.",
      evaluator: {
        type: "match",
        get: (a) => (a.gender === null ? null : a.gender === "M" ? "Male" : "Female"),
      },
    },
    {
      id: "age",
      label: "Age",
      description:
        "Current age in years. Green for an exact match, yellow if within 5 years. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (a) => (a.dob ? computeAge(a.dob, now) : null),
        closeWithin: 5,
      },
    },
    {
      id: "nationality",
      label: "Nationality",
      description: "Country of birth. Green for an exact match.",
      evaluator: { type: "match", get: (a) => a.nationality },
    },
    {
      id: "decade-of-debut",
      label: "Debut",
      description:
        "Decade of first credited film. Green for the same decade, yellow if adjacent. Arrow points toward the answer.",
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
      description:
        "Number of films you and the answer have both appeared in. Yellow if any overlap, green when the filmographies fully match.",
      evaluator: { type: "shared", getIds: (a) => a.filmIds },
    },
  ]
}
