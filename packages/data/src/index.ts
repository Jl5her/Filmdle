import type { Actor, Film, NbaPlayer } from "@stardle/types"
import actorsJson from "./actordle/actors.json" with { type: "json" }
import actorPoolJson from "./actordle/answer_pool.json" with { type: "json" }
import oscarWinnersJson from "./actordle/oscar-winners.json" with { type: "json" }
import nbaPoolJson from "./capcrunch/answer_pool.json" with { type: "json" }
import nbaPlayersJson from "./capcrunch/players.json" with { type: "json" }
import filmPoolJson from "./filmdle/answer_pool.json" with { type: "json" }
import filmsJson from "./filmdle/films.json" with { type: "json" }

export const actors = actorsJson as Actor[]
export const actorAnswerPool = actorPoolJson as string[]
export const oscarWinners = oscarWinnersJson as string[]
export const films = filmsJson as Film[]
export const filmAnswerPool = filmPoolJson as string[]
export const nbaPlayers = nbaPlayersJson as NbaPlayer[]
export const nbaAnswerPool = nbaPoolJson as string[]
