import { actors, films, oscarWinners } from "@stardle/data"
import type { Actor, Gender, MpaaRating } from "@stardle/types"
import type { ActorGuess } from "@/games/actordle/types"
import type { FilmGuess } from "@/games/filmdle/types"
import type { TmdbMovieSearch, TmdbPersonSearch, TmdbReleaseDates } from "./tmdb"
import { getMovieDetails, getPersonDetails, getPersonMovieCredits, searchPerson } from "./tmdb"

const actorsByName = new Map(actors.map((a) => [a.name.toLowerCase(), a]))
const filmsByTitleYear = new Map(films.map((f) => [`${f.title.toLowerCase()}|${f.releaseYear}`, f]))
const oscarWinnerSet = new Set(oscarWinners.map((n) => n.toLowerCase()))

function oscarWinnerForName(name: string): boolean | null {
  return oscarWinnerSet.has(name.toLowerCase()) ? true : null
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

function pickGenre(genres: { name: string }[]): string {
  const preferred = [
    "Crime",
    "Drama",
    "Action",
    "Science Fiction",
    "Romance",
    "Adventure",
    "War",
    "Fantasy",
    "Musical",
    "Music",
    "Thriller",
    "Animation",
    "Horror",
    "Comedy",
    "Mystery",
    "Documentary",
    "Family",
    "Western",
    "History",
  ]
  for (const name of preferred) {
    const hit = genres.find((g) => g.name === name)
    if (hit) return GENRE_REWRITE[hit.name] ?? hit.name
  }
  return genres[0]?.name ?? "Unknown"
}

async function fetchFilmIds(tmdbId: number): Promise<string[]> {
  const credits = await getPersonMovieCredits(tmdbId)
  return credits.cast.map((c) => String(c.id))
}

export async function resolvePerson(p: TmdbPersonSearch): Promise<ActorGuess> {
  const curated = actorsByName.get(p.name.toLowerCase())
  if (curated) {
    if (curated.filmIds && curated.filmIds.length > 0) {
      return { ...curated, filmIds: curated.filmIds }
    }
    const filmIds = await fetchFilmIds(p.id)
    return { ...curated, filmIds }
  }
  const [details, filmIds] = await Promise.all([getPersonDetails(p.id), fetchFilmIds(p.id)])
  return {
    id: `tmdb:person:${p.id}`,
    name: p.name,
    dob: details.birthday ?? "",
    gender: genderFromTmdb(p.gender),
    oscarWinner: oscarWinnerForName(p.name),
    playedRealPerson: null,
    franchise: null,
    filmIds,
  }
}

export async function enrichCuratedActor(actor: Actor): Promise<ActorGuess> {
  if (actor.filmIds && actor.filmIds.length > 0) {
    return { ...actor, filmIds: actor.filmIds }
  }
  try {
    const results = await searchPerson(actor.name)
    const exact = results.find((p) => p.name.toLowerCase() === actor.name.toLowerCase())
    const match = exact ?? results[0]
    if (!match) return { ...actor, filmIds: null }
    const filmIds = await fetchFilmIds(match.id)
    return { ...actor, filmIds }
  } catch {
    return { ...actor, filmIds: null }
  }
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

export async function resolveFilm(m: TmdbMovieSearch): Promise<FilmGuess> {
  const releaseYear = m.release_date ? Number(m.release_date.slice(0, 4)) : 0
  const curated = filmsByTitleYear.get(`${m.title.toLowerCase()}|${releaseYear}`)
  if (curated) return curated
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
