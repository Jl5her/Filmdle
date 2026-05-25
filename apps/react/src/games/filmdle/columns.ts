import type { MpaaRating } from "@stardle/types"
import type { GameColumn } from "../_common/columns"
import type { FilmGuess } from "./types"

const MPAA_ORDER: MpaaRating[] = ["G", "PG", "PG-13", "R", "NC-17"]

function mpaaToNum(rating: MpaaRating | null): number | null {
  if (rating === null) return null
  const idx = MPAA_ORDER.indexOf(rating)
  return idx >= 0 ? idx + 1 : null
}

function numToMpaa(value: number): string {
  const rating = MPAA_ORDER[value - 1]
  return rating ?? "?"
}

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
        closeWithin: 7,
      },
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
      id: "genre",
      label: "Genre",
      evaluator: { type: "match", get: (f) => (f.genre === "Unknown" ? null : f.genre) },
    },
    {
      id: "mpaa",
      label: "Rating",
      evaluator: {
        type: "comparison",
        get: (f) => mpaaToNum(f.mpaaRating),
        closeWithin: 1,
        format: numToMpaa,
      },
    },
    {
      id: "box-office",
      label: "Box Office",
      evaluator: {
        type: "comparison",
        get: (f) => (f.boxOfficeM > 0 ? f.boxOfficeM : null),
        closeWithin: 100,
        format: formatBoxOffice,
      },
    },
  ]
}
