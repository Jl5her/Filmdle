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
      evaluator: {
        type: "comparison",
        get: (f) => (f.releaseYear > 0 ? f.releaseYear : null),
        closeWithin: 5,
      },
    },
    {
      id: "director",
      label: "Director",
      evaluator: { type: "match", get: (f) => (f.director ? f.director : null) },
    },
    {
      id: "genre",
      label: "Genre",
      evaluator: { type: "match", get: (f) => (f.genre === "Unknown" ? null : f.genre) },
    },
    {
      id: "runtime",
      label: "Runtime",
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
      evaluator: {
        type: "comparison",
        get: (f) => (f.boxOfficeM > 0 ? f.boxOfficeM : null),
        closeWithin: 10,
        format: formatBoxOffice,
      },
    },
  ]
}
