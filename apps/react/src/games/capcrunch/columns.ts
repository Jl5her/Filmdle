import type { GameColumn } from "../_common/columns"
import type { CapCrunchGuess } from "./types"

function formatHeight(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`
}

export function buildCapCrunchColumns(): GameColumn<CapCrunchGuess>[] {
  return [
    {
      id: "team",
      label: "Team",
      description: "Current team. Green for an exact match.",
      evaluator: { type: "match", get: (p) => p.team || null },
    },
    {
      id: "conference",
      label: "Conf",
      description: "Conference (East or West). Green for an exact match.",
      evaluator: { type: "match", get: (p) => p.conference || null },
    },
    {
      id: "division",
      label: "Division",
      description: "Division within the conference. Green for an exact match.",
      evaluator: { type: "match", get: (p) => p.division || null },
    },
    {
      id: "position",
      label: "Pos",
      description: "Primary position (PG, SG, SF, PF, C). Green for an exact match.",
      evaluator: { type: "match", get: (p) => p.position || null },
    },
    {
      id: "height",
      label: "Height",
      description:
        "Listed height. Green for an exact match, yellow if within 2 inches. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (p) => (p.heightIn > 0 ? p.heightIn : null),
        closeWithin: 2,
        format: formatHeight,
      },
    },
    {
      id: "age",
      label: "Age",
      description:
        "Age in years. Green for an exact match, yellow if within 2 years. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (p) => (p.age > 0 ? p.age : null),
        closeWithin: 2,
      },
    },
    {
      id: "jersey",
      label: "Number",
      description:
        "Jersey number. Green for an exact match, yellow if within 3. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (p) => (p.jersey >= 0 ? p.jersey : null),
        closeWithin: 3,
        format: (n) => `#${n}`,
      },
    },
  ]
}
