import type { Gender } from "@stardle/types"

export interface ActorGuess {
  id: string
  name: string
  dob: string
  gender: Gender | null
  oscarWinner: boolean | null
  playedRealPerson: boolean | null
  franchise: boolean | null
  filmIds: string[] | null
}
