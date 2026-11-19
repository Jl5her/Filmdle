export type Gender = "M" | "F"

export interface Actor {
  id: string
  name: string
  dob: string
  gender: Gender
  nationality: string
  debutYear: number
  oscarWinner: boolean
  playedRealPerson: boolean
  franchise: boolean
  tmdbId?: number
  filmIds?: string[]
}

export type MpaaRating = "G" | "PG" | "PG-13" | "R" | "NC-17"

export interface Film {
  id: string
  title: string
  releaseYear: number
  genre: string
  director: string
  boxOfficeM: number
  bestPicture: boolean
  runtime: number
  mpaaRating: MpaaRating
}

export type TileStatus = "correct" | "close" | "incorrect" | "unknown"
export type Arrow = "↑" | "↓"

export interface EvaluatedCell {
  value: string
  status: TileStatus
  arrow?: Arrow
}

export interface GameInfo {
  id: "actordle" | "filmdle"
  displayName: string
  subtitle: string
}

export interface GameResult {
  dateKey: string
  answerId: string
  guesses: string[]
  outcome: "win" | "loss"
  guessCount: number
}

export interface CreditdleCredit {
  tmdbId: number
  title: string
  year: number
  posterPath: string | null
}

export interface CreditdleActor {
  id: string
  name: string
  tmdbId: number
  credits: CreditdleCredit[]
}

export type PlotDifficulty = "easy" | "medium" | "hard"

export interface PlotdlePlot {
  /** Puzzle number. Stable forever: shared links are /plotdle/<id>. Append-only. */
  id: number
  plot: string
  title: string
  year: number
  animated: boolean
  difficulty: PlotDifficulty
  /** Poorly written description of the main character (tap-to-reveal hint). */
  character: string
  /** Primary TMDB genre name (tap-to-reveal hint). */
  genre: string
  /** TMDB movie id, filled by scripts/plotdle/sync-tmdb.mjs. 0 if unresolved. */
  tmdbId: number
}
