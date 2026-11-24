import type { GameColumn } from "../_common/columns"
import type { FilmGuess } from "./types"

function formatBoxOffice(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`
  return `$${m}M`
}

/**
 * Genres that count toward partial credit. Drama is on most films, so
 * sharing only Drama doesn't earn a yellow.
 */
function genreTags(f: FilmGuess): string[] {
  const all = f.genres && f.genres.length > 0 ? f.genres : [f.genre]
  return all.filter((g) => g !== "Drama" && g !== "Unknown")
}

const YEAR_CLOSE = 5
const RUNTIME_CLOSE = 15
const BOX_OFFICE_CLOSE = 10

export function buildFilmdleColumns(): GameColumn<FilmGuess>[] {
  return [
    {
      id: "year",
      guide: {
        about: "Year of release.",
        green: "Same year",
        yellow: `Within ${YEAR_CLOSE} years`,
      },
      label: "Year",
      description:
        "Year of theatrical release. Green for an exact match, yellow if within 5 years. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (f) => (f.releaseYear > 0 ? f.releaseYear : null),
        closeWithin: YEAR_CLOSE,
      },
    },
    {
      id: "director",
      guide: { about: "Credited director.", green: "Same director" },
      label: "Director",
      description: "Credited director. Green for an exact match.",
      evaluator: { type: "match", get: (f) => (f.director ? f.director : null) },
    },
    {
      id: "genre",
      guide: {
        about:
          "Main genre: the most specific one the film has. An action comedy counts as Comedy; Drama only when nothing else fits.",
        green: "Same main genre",
        yellow: "Shares any other genre (sharing only Drama doesn't count)",
      },
      label: "Genre",
      description:
        "Main genre: the most specific one the film has, so an action comedy counts as Comedy and Drama only when nothing else fits. Green for the same main genre, yellow if the films share any other genre (sharing only Drama doesn't count).",
      evaluator: {
        type: "tags",
        get: (f) => (f.genre === "Unknown" ? null : f.genre),
        getTags: genreTags,
      },
    },
    {
      id: "runtime",
      guide: {
        about: "Length in minutes.",
        green: "Same length",
        yellow: `Within ${RUNTIME_CLOSE} minutes`,
      },
      label: "Runtime",
      description:
        "Length in minutes. Green for an exact match, yellow if within 15 minutes. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (f) => (f.runtime > 0 ? f.runtime : null),
        closeWithin: RUNTIME_CLOSE,
        format: (m) => `${m}m`,
      },
    },
    {
      id: "box-office",
      guide: {
        about: "Worldwide box office.",
        green: "Same amount",
        yellow: `Within $${BOX_OFFICE_CLOSE} million`,
      },
      label: "Box Office",
      description:
        "Worldwide gross in millions. Green for an exact match, yellow if within $10M. Arrow points toward the answer.",
      evaluator: {
        type: "comparison",
        get: (f) => (f.boxOfficeM > 0 ? f.boxOfficeM : null),
        closeWithin: BOX_OFFICE_CLOSE,
        format: formatBoxOffice,
      },
    },
  ]
}
