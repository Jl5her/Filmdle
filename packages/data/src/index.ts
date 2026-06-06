import type { Actor, CreditdleActor, Film } from "@stardle/types"
import actorsJson from "./actordle/actors.json" with { type: "json" }
import actorPoolJson from "./actordle/answer_pool.json" with { type: "json" }
import oscarWinnersJson from "./actordle/oscar-winners.json" with { type: "json" }
import movieActorsJson from "./creditdle/movie-actors.json" with { type: "json" }
import movieActorPoolJson from "./creditdle/movie-answer-pool.json" with { type: "json" }
import tvActorsJson from "./creditdle/tv-actors.json" with { type: "json" }
import tvActorPoolJson from "./creditdle/tv-answer-pool.json" with { type: "json" }
import filmPoolJson from "./filmdle/answer_pool.json" with { type: "json" }
import filmsJson from "./filmdle/films.json" with { type: "json" }

export const actors = actorsJson as Actor[]
export const actorAnswerPool = actorPoolJson as string[]
export const oscarWinners = oscarWinnersJson as string[]
export const films = filmsJson as Film[]
export const filmAnswerPool = filmPoolJson as string[]
export const movieActors = movieActorsJson as CreditdleActor[]
export const movieActorAnswerPool = movieActorPoolJson as string[]
export const tvActors = tvActorsJson as CreditdleActor[]
export const tvActorAnswerPool = tvActorPoolJson as string[]
