import type { GameColumn } from "../_common/columns"
import type { FilmGuess } from "./types"

function formatBoxOffice(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`
  return `$${m}M`
}

export function buildFilmdleColumns(): GameColumn<FilmGuess>[] {
  return [
    {
      id: "year",
      label: "Released",
      description:
        "Year of theatrical release. Green for an exact match, yellow if within 5 years. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (f) => (f.releaseYear > 0 ? f.releaseYear : null),
        closeWithin: 5,
      },
    },
    {
      id: "director",
      label: "Director",
      description: "Credited director. Green for an exact match.",
      evaluator: { type: "match", get: (f) => (f.director ? f.director : null) },
    },
    {
      id: "genre",
      label: "Genre",
      description: "Primary genre. Green for an exact match.",
      evaluator: { type: "match", get: (f) => (f.genre === "Unknown" ? null : f.genre) },
    },
    {
      id: "runtime",
      label: "Runtime",
      description:
        "Length in minutes. Green for an exact match, yellow if within 15 minutes. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (f) => (f.runtime > 0 ? f.runtime : null),
        closeWithin: 15,
        format: (m) => `${m}m`,
      },
    },
    {
      id: "box-office",
      label: "Box Office",
      description:
        "Worldwide gross in millions. Green for an exact match, yellow if within $10M. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (f) => (f.boxOfficeM > 0 ? f.boxOfficeM : null),
        closeWithin: 10,
        format: formatBoxOffice,
      },
    },
  ]
}
