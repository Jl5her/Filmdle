import { actorAnswerPool, actors } from "@stardle/data"
import type { Actor } from "@stardle/types"
import { useCallback, useMemo } from "react"
import type { Suggestion } from "@/games/_common/components/guess-input"
import { GameScreen } from "@/games/_common/screens/game-screen"
import { searchPerson } from "@/lib/tmdb"
import { enrichCuratedActor, resolvePerson } from "@/lib/tmdb-adapters"
import { buildCuratedSearch, normaliseName } from "@/shared/lib/curated-search"
import { buildActordleColumns } from "../columns"
import type { ActorGuess } from "../types"

const searchCache = new Map<
  number,
  { tmdb: import("@/lib/tmdb").TmdbPersonSearch; resolved?: ActorGuess }
>()

const curated = buildCuratedSearch(actors, "name")

export default function ActordleGame() {
  const columns = useMemo(() => buildActordleColumns(), [])

  const fetchSuggestions = useCallback(
    async (query: string, signal: AbortSignal): Promise<Suggestion[]> => {
      const localMatches = curated.search(query, 4)
      const localSuggestions: Suggestion[] = localMatches.map((actor) => ({
        key: `c:${actor.id}`,
        label: actor.name,
      }))
      const seen = new Set(localMatches.map((a) => normaliseName(a.name)))

      // TMDB failures shouldn't kill the dropdown — keep the local
      // curated matches visible even if the upstream search errors.
      let tmdbResults: Awaited<ReturnType<typeof searchPerson>> = []
      try {
        tmdbResults = (await searchPerson(query, signal)).slice(0, 8)
      } catch (err) {
        if ((err as Error).name === "AbortError") throw err
      }
      const tmdbSuggestions: Suggestion[] = []
      for (const r of tmdbResults) {
        if (seen.has(normaliseName(r.name))) continue
        if (!searchCache.has(r.id)) searchCache.set(r.id, { tmdb: r })
        tmdbSuggestions.push({
          key: `t:${r.id}`,
          label: r.name,
        })
        if (localSuggestions.length + tmdbSuggestions.length >= 8) break
      }
      return [...localSuggestions, ...tmdbSuggestions]
    },
    [],
  )

  const resolveByKey = useCallback(async (key: string): Promise<ActorGuess> => {
    if (key.startsWith("c:")) {
      const actor = curated.get(key.slice(2))
      if (!actor) throw new Error(`Unknown curated actor: ${key}`)
      return { ...actor, filmIds: actor.filmIds ?? null }
    }
    const tmdbId = Number(key.startsWith("t:") ? key.slice(2) : key)
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
