import { actors, films, oscarWinners } from "@stardle/data"
import type { Actor, Gender, MpaaRating } from "@stardle/types"
import type { ActorGuess } from "@/games/actordle/types"
import type { FilmGuess } from "@/games/filmdle/types"
import type {
  TmdbMovieSearch,
  TmdbPersonMovieCredits,
  TmdbPersonSearch,
  TmdbReleaseDates,
} from "./tmdb"
import {
  getMovieDetails,
  getPersonDetails,
  getPersonMovieCredits,
  searchMovie,
  searchPerson,
} from "./tmdb"

const actorsByName = new Map(actors.map((a) => [a.name.toLowerCase(), a]))
const filmsByTitleYear = new Map(films.map((f) => [`${f.title.toLowerCase()}|${f.releaseYear}`, f]))
const oscarWinnerSet = new Set(oscarWinners.map((n) => n.toLowerCase()))

function oscarWinnerForName(name: string): boolean {
  return oscarWinnerSet.has(name.toLowerCase())
}

function genderFromTmdb(code: number): Gender | null {
  if (code === 1) return "F"
  if (code === 2) return "M"
  return null
}

const GENRE_REWRITE: Record<string, string> = {
  "Science Fiction": "SciFi",
  Music: "Musical",
}

/**
 * Primary genre = the most specific genre a film carries, not TMDB's first
 * tag. Distinctive genres that define how a film feels come first; broad
 * ones that get attached to almost everything come last. Drama is the
 * catch-all, so it only wins when a film has nothing else.
 * An action comedy is a Comedy; an animated fantasy is Animation.
 */
const GENRE_SPECIFICITY = [
  "Animation",
  "Documentary",
  "Horror",
  "Western",
  "Music",
  "War",
  "Science Fiction",
  "Fantasy",
  "Comedy",
  "Action",
  "Crime",
  "Thriller",
  "Romance",
  "Mystery",
  "History",
  "Adventure",
  "Family",
  "Drama",
]

export function pickGenre(genres: { name: string }[]): string {
  for (const name of GENRE_SPECIFICITY) {
    if (genres.some((g) => g.name === name)) return GENRE_REWRITE[name] ?? name
  }
  const first = genres[0]?.name
  return first ? (GENRE_REWRITE[first] ?? first) : "Unknown"
}

const COUNTRY_ALIASES: Record<string, string> = {
  "United States of America": "USA",
  "United States": "USA",
  "U.S.": "USA",
  "U.S.A.": "USA",
  "United Kingdom": "UK",
  "U.K.": "UK",
}

function nationalityFromPlaceOfBirth(place: string | null): string | null {
  if (!place) return null
  const parts = place
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const last = parts[parts.length - 1]
  if (!last) return null
  return COUNTRY_ALIASES[last] ?? last
}

function debutYearFromCredits(credits: TmdbPersonMovieCredits): number | null {
  let earliest: number | null = null
  for (const c of credits.cast) {
    if (!c.release_date) continue
    const year = Number(c.release_date.slice(0, 4))
    if (!year || year < 1900) continue
    if (earliest === null || year < earliest) earliest = year
  }
  return earliest
}

async function fetchCredits(tmdbId: number): Promise<TmdbPersonMovieCredits> {
  return getPersonMovieCredits(tmdbId)
}

export async function resolvePerson(p: TmdbPersonSearch): Promise<ActorGuess> {
  const curated = actorsByName.get(p.name.toLowerCase())
  if (curated) return enrichCuratedActor(curated, p.id)
  const [details, credits] = await Promise.all([getPersonDetails(p.id), fetchCredits(p.id)])
  return {
    id: `tmdb:person:${p.id}`,
    name: p.name,
    dob: details.birthday ?? "",
    gender: genderFromTmdb(p.gender),
    nationality: nationalityFromPlaceOfBirth(details.place_of_birth),
    debutYear: debutYearFromCredits(credits),
    oscarWinner: oscarWinnerForName(p.name),
    playedRealPerson: null,
    franchise: null,
    filmIds: credits.cast.map((c) => String(c.id)),
  }
}

const curatedActorCache = new Map<string, Promise<ActorGuess>>()

/**
 * Curated actors that haven't been synced (no filmIds) were written by hand.
 * Fill in their films and refresh birth date, birthplace and debut from TMDB,
 * the same way TMDB guesses are built, so answers and guesses always agree.
 * Hand-written values stay as the fallback when TMDB is unreachable.
 */
export function enrichCuratedActor(actor: Actor, tmdbId?: number): Promise<ActorGuess> {
  if (actor.filmIds && actor.filmIds.length > 0) {
    return Promise.resolve({ ...actor, filmIds: actor.filmIds })
  }
  let pending = curatedActorCache.get(actor.id)
  if (!pending) {
    pending = (async (): Promise<ActorGuess> => {
      try {
        let id = tmdbId ?? (actor.tmdbId || undefined)
        if (id === undefined) {
          const results = await searchPerson(actor.name)
          const exact = results.find((p) => p.name.toLowerCase() === actor.name.toLowerCase())
          id = (exact ?? results[0])?.id
        }
        if (id === undefined) return { ...actor, filmIds: null }
        const [details, credits] = await Promise.all([getPersonDetails(id), fetchCredits(id)])
        return {
          ...actor,
          dob: details.birthday || actor.dob,
          nationality: nationalityFromPlaceOfBirth(details.place_of_birth) ?? actor.nationality,
          debutYear: debutYearFromCredits(credits) ?? actor.debutYear,
          filmIds: credits.cast.map((c) => String(c.id)),
        }
      } catch {
        curatedActorCache.delete(actor.id)
        return { ...actor, filmIds: null }
      }
    })()
    curatedActorCache.set(actor.id, pending)
  }
  return pending
}

const VALID_MPAA: ReadonlySet<MpaaRating> = new Set(["G", "PG", "PG-13", "R", "NC-17"])

function extractMpaa(releaseDates: TmdbReleaseDates | undefined): MpaaRating | null {
  if (!releaseDates) return null
  const us = releaseDates.results.find((r) => r.iso_3166_1 === "US")
  if (!us) return null
  for (const rd of us.release_dates) {
    const cert = rd.certification as MpaaRating
    if (VALID_MPAA.has(cert)) return cert
  }
  return null
}

const curatedFilmCache = new Map<string, Promise<FilmGuess>>()

/**
 * Curated films are hand-written. Refresh genre, director, box office,
 * runtime and rating from TMDB with the same rules TMDB guesses use, so an
 * answer and a guess are never described differently. Hand-written values
 * are the fallback offline or where TMDB has no figure.
 */
export function enrichCuratedFilm(film: FilmGuess, tmdbId?: number): Promise<FilmGuess> {
  let pending = curatedFilmCache.get(film.id)
  if (!pending) {
    pending = (async () => {
      try {
        let id = tmdbId
        if (id === undefined) {
          const results = await searchMovie(film.title)
          id = results.find((r) => r.release_date?.startsWith(String(film.releaseYear)))?.id
        }
        if (id === undefined) return film
        const details = await getMovieDetails(id)
        const director = details.credits.crew.find((c) => c.job === "Director")?.name
        return {
          ...film,
          genre: details.genres.length > 0 ? pickGenre(details.genres) : film.genre,
          director: director ?? film.director,
          boxOfficeM: details.revenue ? Math.round(details.revenue / 1_000_000) : film.boxOfficeM,
          runtime: details.runtime || film.runtime,
          mpaaRating: extractMpaa(details.release_dates) ?? film.mpaaRating,
        }
      } catch {
        curatedFilmCache.delete(film.id)
        return film
      }
    })()
    curatedFilmCache.set(film.id, pending)
  }
  return pending
}

export async function resolveFilm(m: TmdbMovieSearch): Promise<FilmGuess> {
  const releaseYear = m.release_date ? Number(m.release_date.slice(0, 4)) : 0
  const curated = filmsByTitleYear.get(`${m.title.toLowerCase()}|${releaseYear}`)
  if (curated) return enrichCuratedFilm(curated, m.id)
  const details = await getMovieDetails(m.id)
  const director = details.credits.crew.find((c) => c.job === "Director")?.name ?? "Unknown"
  return {
    id: `tmdb:movie:${m.id}`,
    title: m.title,
    releaseYear,
    genre: pickGenre(details.genres),
    director,
    boxOfficeM: details.revenue ? Math.round(details.revenue / 1_000_000) : 0,
    bestPicture: null,
    runtime: details.runtime ?? 0,
    mpaaRating: extractMpaa(details.release_dates),
  }
}
