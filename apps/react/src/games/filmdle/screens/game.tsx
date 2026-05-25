import { filmAnswerPool, films } from "@stardle/data"
import { useCallback, useMemo } from "react"
import type { Suggestion } from "@/games/_common/components/guess-input"
import { GameScreen } from "@/games/_common/screens/game-screen"
import { searchMovie } from "@/lib/tmdb"
import { resolveFilm } from "@/lib/tmdb-adapters"
import { buildFilmdleColumns } from "../columns"
import type { FilmGuess } from "../types"

const searchCache = new Map<
  number,
  { tmdb: import("@/lib/tmdb").TmdbMovieSearch; resolved?: FilmGuess }
>()

export default function FilmdleGame() {
  const columns = useMemo(() => buildFilmdleColumns(), [])

  const fetchSuggestions = useCallback(
    async (query: string, signal: AbortSignal): Promise<Suggestion[]> => {
      const results = (await searchMovie(query, signal)).slice(0, 5)
      for (const r of results) {
        if (!searchCache.has(r.id)) searchCache.set(r.id, { tmdb: r })
      }
      return results.map((r) => ({
        key: String(r.id),
        label: r.title,
        imageUrl: r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : "",
      }))
    },
    [],
  )

  const resolveByKey = useCallback(async (key: string): Promise<FilmGuess> => {
    const tmdbId = Number(key)
    const cached = searchCache.get(tmdbId)
    if (cached?.resolved) return cached.resolved
    const tmdb = cached?.tmdb
    if (!tmdb) throw new Error(`Unknown TMDB movie id: ${key}`)
    const resolved = await resolveFilm(tmdb)
    searchCache.set(tmdbId, { tmdb, resolved })
    return resolved
  }, [])

  return (
    <GameScreen<FilmGuess>
      title="Filmdle"
      gameKey="filmdle"
      curatedItems={films}
      answerPool={filmAnswerPool}
      idOf={(f) => f.id}
      nameOf={(f) => f.title}
      columns={columns}
      searchPlaceholder="Type a film title..."
      fetchSuggestions={fetchSuggestions}
      resolveByKey={resolveByKey}
    />
  )
}
