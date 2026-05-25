export type Gender = "M" | "F"

export interface Actor {
  id: string
  name: string
  dob: string
  gender: Gender
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
