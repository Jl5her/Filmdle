const BASE = "/tmdb"

const CACHE_PREFIX = "filmdle-tmdb-cache:v1"
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface CacheEntry {
  ts: number
  body: string
}

function readCache(path: string): unknown | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}:${path}`)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null
    return JSON.parse(entry.body)
  } catch {
    return null
  }
}

function writeCache(path: string, body: string): void {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}:${path}`,
      JSON.stringify({ ts: Date.now(), body } satisfies CacheEntry),
    )
  } catch {
    // quota exceeded or storage disabled — best-effort only
  }
}

interface TmdbSearchResponse<T> {
  page: number
  total_results: number
  total_pages: number
  results: T[]
}

export interface TmdbPersonSearch {
  id: number
  name: string
  gender: number
  popularity: number
  known_for_department?: string
  profile_path: string | null
}

export interface TmdbMovieSearch {
  id: number
  title: string
  release_date: string
  popularity: number
  vote_count: number
  poster_path: string | null
}

export interface TmdbPersonDetails extends TmdbPersonSearch {
  birthday: string | null
  deathday: string | null
  biography: string
}

export interface TmdbMovieDetails extends TmdbMovieSearch {
  genres: { id: number; name: string }[]
  revenue: number
  runtime: number | null
}

export interface TmdbCrewMember {
  job: string
  department: string
  name: string
  id: number
}

export interface TmdbCredits {
  crew: TmdbCrewMember[]
}

export interface TmdbReleaseDate {
  certification: string
  type: number
}

export interface TmdbReleaseDateGroup {
  iso_3166_1: string
  release_dates: TmdbReleaseDate[]
}

export interface TmdbReleaseDates {
  results: TmdbReleaseDateGroup[]
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const cached = readCache(path)
  if (cached !== null) return cached as T
  const res = await fetch(`${BASE}${path}`, { signal })
  if (!res.ok) throw new Error(`TMDB ${res.status} on ${path}`)
  const body = await res.text()
  writeCache(path, body)
  return JSON.parse(body) as T
}

export async function searchPerson(
  query: string,
  signal?: AbortSignal,
): Promise<TmdbPersonSearch[]> {
  if (!query.trim()) return []
  const data = await get<TmdbSearchResponse<TmdbPersonSearch>>(
    `/search/person?query=${encodeURIComponent(query)}&include_adult=false&page=1`,
    signal,
  )
  return data.results
    .filter((p) => p.known_for_department === "Acting")
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8)
}

export async function searchMovie(
  query: string,
  signal?: AbortSignal,
): Promise<TmdbMovieSearch[]> {
  if (!query.trim()) return []
  const data = await get<TmdbSearchResponse<TmdbMovieSearch>>(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&page=1`,
    signal,
  )
  return data.results
    .filter((m) => m.vote_count >= 50)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8)
}

export async function getPersonDetails(
  id: number,
  signal?: AbortSignal,
): Promise<TmdbPersonDetails> {
  return get<TmdbPersonDetails>(`/person/${id}`, signal)
}

export interface TmdbPersonMovieCredits {
  cast: { id: number; title: string }[]
}

export async function getPersonMovieCredits(
  id: number,
  signal?: AbortSignal,
): Promise<TmdbPersonMovieCredits> {
  return get<TmdbPersonMovieCredits>(`/person/${id}/movie_credits`, signal)
}

export async function getMovieDetails(
  id: number,
  signal?: AbortSignal,
): Promise<TmdbMovieDetails & { credits: TmdbCredits; release_dates: TmdbReleaseDates }> {
  return get<TmdbMovieDetails & { credits: TmdbCredits; release_dates: TmdbReleaseDates }>(
    `/movie/${id}?append_to_response=credits,release_dates`,
    signal,
  )
}
