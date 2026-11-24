import type { MpaaRating } from "@stardle/types"

export interface FilmGuess {
  id: string
  title: string
  releaseYear: number
  genre: string
  /** Every genre the film has (TMDB names, rewritten). Missing on old saved guesses. */
  genres?: string[]
  director: string
  boxOfficeM: number
  bestPicture: boolean | null
  runtime: number
  mpaaRating: MpaaRating | null
}
