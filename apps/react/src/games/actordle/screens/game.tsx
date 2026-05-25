import { actorAnswerPool, actors } from "@stardle/data"
import type { Actor } from "@stardle/types"
import { useCallback, useMemo } from "react"
import type { Suggestion } from "@/games/_common/components/guess-input"
import { GameScreen } from "@/games/_common/screens/game-screen"
import { enrichCuratedActor, resolvePerson } from "@/lib/tmdb-adapters"
import { searchPerson } from "@/lib/tmdb"
import { buildActordleColumns } from "../columns"
import type { ActorGuess } from "../types"

const searchCache = new Map<number, { tmdb: import("@/lib/tmdb").TmdbPersonSearch; resolved?: ActorGuess }>()

export default function ActordleGame() {
  const columns = useMemo(() => buildActordleColumns(), [])

  const fetchSuggestions = useCallback(
    async (query: string, signal: AbortSignal): Promise<Suggestion[]> => {
      const results = await searchPerson(query, signal)
      for (const r of results) {
        if (!searchCache.has(r.id)) searchCache.set(r.id, { tmdb: r })
      }
      return results.map((r) => ({
        key: String(r.id),
        label: r.name,
      }))
    },
    [],
  )

  const resolveByKey = useCallback(async (key: string): Promise<ActorGuess> => {
    const tmdbId = Number(key)
    const cached = searchCache.get(tmdbId)
    if (cached?.resolved) return cached.resolved
    const tmdb = cached?.tmdb
    if (!tmdb) throw new Error(`Unknown TMDB person id: ${key}`)
    const resolved = await resolvePerson(tmdb)
    searchCache.set(tmdbId, { tmdb, resolved })
    return resolved
  }, [])

  const enrichAnswer = useCallback(async (a: ActorGuess): Promise<ActorGuess> => {
    if (a.filmIds && a.filmIds.length > 0) return a
    return enrichCuratedActor(a as Actor)
  }, [])

  const curatedAsGuesses: ActorGuess[] = useMemo(
    () => actors.map((a) => ({ ...a, filmIds: a.filmIds ?? null })),
    [],
  )

  return (
    <GameScreen<ActorGuess>
      title="Actordle"
      gameKey="actordle"
      curatedItems={curatedAsGuesses}
      answerPool={actorAnswerPool}
      idOf={(a) => a.id}
      nameOf={(a) => a.name}
      columns={columns}
      searchPlaceholder="Type an actor's name..."
      fetchSuggestions={fetchSuggestions}
      resolveByKey={resolveByKey}
      enrichAnswer={enrichAnswer}
    />
  )
}
