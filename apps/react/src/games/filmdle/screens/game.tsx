import { filmAnswerPool, films } from "@stardle/data"
import { useCallback, useMemo } from "react"
import type { Suggestion } from "@/games/_common/components/guess-input"
import { GameScreen } from "@/games/_common/screens/game-screen"
import { searchMovie } from "@/lib/tmdb"
import { resolveFilm } from "@/lib/tmdb-adapters"
import { buildCuratedSearch, normaliseName } from "@/shared/lib/curated-search"
import { buildFilmdleColumns } from "../columns"
import type { FilmGuess } from "../types"

const searchCache = new Map<
  number,
  { tmdb: import("@/lib/tmdb").TmdbMovieSearch; resolved?: FilmGuess }
>()

const curated = buildCuratedSearch(films, "title")

export default function FilmdleGame() {
  const columns = useMemo(() => buildFilmdleColumns(), [])

  const fetchSuggestions = useCallback(
    async (query: string, signal: AbortSignal): Promise<Suggestion[]> => {
      const localMatches = curated.search(query, 4)
      const localSuggestions: Suggestion[] = localMatches.map((film) => ({
        key: `c:${film.id}`,
        label: film.title,
      }))
      const seen = new Set(localMatches.map((film) => normaliseName(film.title)))

      // TMDB failures shouldn't kill the dropdown — keep the local
      // curated matches visible even if the upstream search errors.
      let tmdbResults: Awaited<ReturnType<typeof searchMovie>> = []
      try {
        tmdbResults = (await searchMovie(query, signal)).slice(0, 8)
      } catch (err) {
        if ((err as Error).name === "AbortError") throw err
      }
      const tmdbSuggestions: Suggestion[] = []
      for (const r of tmdbResults) {
        if (seen.has(normaliseName(r.title))) continue
        if (!searchCache.has(r.id)) searchCache.set(r.id, { tmdb: r })
        tmdbSuggestions.push({
          key: `t:${r.id}`,
          label: r.title,
          imageUrl: r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : "",
        })
        if (localSuggestions.length + tmdbSuggestions.length >= 8) break
      }
      return [...localSuggestions, ...tmdbSuggestions]
    },
    [],
  )

  const resolveByKey = useCallback(async (key: string): Promise<FilmGuess> => {
    if (key.startsWith("c:")) {
      const film = curated.get(key.slice(2))
      if (!film) throw new Error(`Unknown curated film: ${key}`)
      return film as FilmGuess
    }
    const tmdbId = Number(key.startsWith("t:") ? key.slice(2) : key)
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
