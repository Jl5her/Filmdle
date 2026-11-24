import { computeAge } from "@/shared/lib/date"
import type { GameColumn } from "../_common/columns"
import type { ActorGuess } from "./types"

const AGE_CLOSE = 5

export function buildActordleColumns(now = new Date()): GameColumn<ActorGuess>[] {
  return [
    {
      id: "gender",
      guide: { about: "Male or female.", green: "Same gender" },
      label: "Gender",
      description: "Male or Female. Green if it matches the answer.",
      evaluator: {
        type: "match",
        get: (a) => (a.gender === null ? null : a.gender === "M" ? "Male" : "Female"),
      },
    },
    {
      id: "age",
      guide: { about: "Current age.", green: "Same age", yellow: `Within ${AGE_CLOSE} years` },
      label: "Age",
      description:
        "Current age in years. Green for an exact match, yellow if within 5 years. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (a) => (a.dob ? computeAge(a.dob, now) : null),
        closeWithin: AGE_CLOSE,
      },
    },
    {
      id: "nationality",
      guide: { about: "Country of birth.", green: "Same country" },
      label: "From",
      description: "Country of birth. Green for an exact match.",
      evaluator: { type: "match", get: (a) => a.nationality },
    },
    {
      id: "decade-of-debut",
      guide: {
        about: "Decade of their first credited film.",
        green: "Same decade",
        yellow: "The decade before or after",
      },
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
      guide: {
        about: "How many films they and the answer have both been in.",
        green: "Every film shared (same person)",
        yellow: "At least one film in common",
      },
      label: "Common",
      description:
        "Number of films you and the answer have both appeared in. Yellow if any overlap, green when the filmographies fully match.",
      evaluator: { type: "shared", getIds: (a) => a.filmIds },
    },
  ]
}
