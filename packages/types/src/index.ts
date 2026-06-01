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

export type Conference = "East" | "West"

export interface NbaPlayer {
  id: string
  name: string
  team: string
  conference: Conference
  division: string
  position: string
  heightIn: number
  age: number
  jersey: number
}

export type TileStatus = "correct" | "close" | "incorrect" | "unknown"
export type Arrow = "↑" | "↓"

export interface EvaluatedCell {
  value: string
  status: TileStatus
  arrow?: Arrow
}

export interface GameInfo {
  id: "actordle" | "filmdle" | "capcrunch"
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
