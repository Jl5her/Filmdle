#!/usr/bin/env node
// Builds/refreshes packages/data/src/creditdle/movie-actors.json and
// tv-actors.json from TMDB.
//
// For movies: fetches each actor's movie_credits, filters to top-billed
// (cast order <= 3) films with vote_count >= 500, requires >= 5 qualifying
// credits, keeps up to 8 sorted by vote_count ascending (hardest first).
//
// For TV: fetches tv_credits, filters to roles with episode_count >= 5,
// requires >= 5 qualifying shows, keeps up to 8 sorted by episode_count
// ascending (least-known first).
//
// Reads bearer token from apps/react/.env.local (TMDB_BEARER=...).
// Run: node scripts/sync-creditdle.mjs

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const DATA_ROOT = resolve(ROOT, "packages/data/src/creditdle")
const ENV_PATH = resolve(ROOT, "apps/react/.env.local")

const MOVIE_MIN_VOTES = 500
const MOVIE_MAX_ORDER = 3
const MOVIE_MIN_CREDITS = 5
const MOVIE_MAX_CREDITS = 8

const TV_MIN_EPISODES = 5
const TV_MIN_CREDITS = 5
const TV_MAX_CREDITS = 8

function readBearer() {
  let env
  try {
    env = readFileSync(ENV_PATH, "utf-8")
  } catch {
    throw new Error(`Missing ${ENV_PATH} — needs a line TMDB_BEARER=...`)
  }
  const m = env.match(/^TMDB_BEARER=(.+)$/m)
  if (!m) throw new Error(`No TMDB_BEARER line in ${ENV_PATH}`)
  return m[1].trim()
}

const BASE = "https://api.themoviedb.org/3"

async function tmdb(path, bearer) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${bearer}`, Accept: "application/json" },
  })
  if (!res.ok) throw new Error(`TMDB ${res.status} on ${path}: ${await res.text()}`)
  return res.json()
}

async function resolveActorTmdbId(actor, bearer) {
  if (actor.tmdbId && actor.tmdbId !== 0) return actor.tmdbId
  const search = await tmdb(
    `/search/person?query=${encodeURIComponent(actor.name)}&include_adult=false&page=1`,
    bearer,
  )
  const results = (search.results ?? []).filter((p) => p.known_for_department === "Acting")
  const exact = results.find((p) => p.name.toLowerCase() === actor.name.toLowerCase())
  const match = exact ?? results.sort((a, b) => b.popularity - a.popularity)[0]
  return match?.id ?? null
}

async function syncMovieActor(actor, bearer) {
  process.stdout.write(`  ${actor.name.padEnd(28)} `)
  const tmdbId = await resolveActorTmdbId(actor, bearer)
  if (!tmdbId) {
    console.log("✗ not found")
    return null
  }

  const creditsData = await tmdb(`/person/${tmdbId}/movie_credits`, bearer)
  const cast = creditsData.cast ?? []

  const qualifying = cast
    .filter((c) => (c.order ?? 99) <= MOVIE_MAX_ORDER && (c.vote_count ?? 0) >= MOVIE_MIN_VOTES)
    .sort((a, b) => (a.vote_count ?? 0) - (b.vote_count ?? 0))

  if (qualifying.length < MOVIE_MIN_CREDITS) {
    console.log(`✗ only ${qualifying.length} qualifying credits (need ${MOVIE_MIN_CREDITS})`)
    return null
  }

  const credits = qualifying.slice(0, MOVIE_MAX_CREDITS).map((c) => ({
    tmdbId: c.id,
    title: c.title,
    year: c.release_date ? Number(c.release_date.slice(0, 4)) : 0,
    posterPath: c.poster_path ?? null,
  }))

  console.log(`✓ tmdb:${tmdbId}, ${qualifying.length} qualifying → ${credits.length} credits`)
  return { ...actor, tmdbId, credits }
}

async function syncTvActor(actor, bearer) {
  process.stdout.write(`  ${actor.name.padEnd(28)} `)
  const tmdbId = await resolveActorTmdbId(actor, bearer)
  if (!tmdbId) {
    console.log("✗ not found")
    return null
  }

  const creditsData = await tmdb(`/person/${tmdbId}/tv_credits`, bearer)
  const cast = creditsData.cast ?? []

  const qualifying = cast
    .filter((c) => (c.episode_count ?? 0) >= TV_MIN_EPISODES)
    .sort((a, b) => (a.episode_count ?? 0) - (b.episode_count ?? 0))

  if (qualifying.length < TV_MIN_CREDITS) {
    console.log(`✗ only ${qualifying.length} qualifying credits (need ${TV_MIN_CREDITS})`)
    return null
  }

  const credits = qualifying.slice(0, TV_MAX_CREDITS).map((c) => ({
    tmdbId: c.id,
    title: c.name,
    year: c.first_air_date ? Number(c.first_air_date.slice(0, 4)) : 0,
    posterPath: c.poster_path ?? null,
  }))

  console.log(`✓ tmdb:${tmdbId}, ${qualifying.length} qualifying → ${credits.length} credits`)
  return { ...actor, tmdbId, credits }
}

async function syncFile(inputPath, outputPath, syncFn, bearer) {
  const actors = JSON.parse(readFileSync(inputPath, "utf-8"))
  const updated = []
  let ok = 0
  let failed = 0

  for (const actor of actors) {
    const result = await syncFn(actor, bearer)
    if (result) {
      updated.push(result)
      ok++
    } else {
      updated.push(actor)
      failed++
    }
    await new Promise((r) => setTimeout(r, 200))
  }

  writeFileSync(outputPath, `${JSON.stringify(updated, null, 2)}\n`)
  return { ok, failed }
}

async function main() {
  const mode = process.argv[2] ?? "all"
  const bearer = readBearer()

  if (mode === "movies" || mode === "all") {
    console.log("\nSyncing movie actors…")
    const { ok, failed } = await syncFile(
      resolve(DATA_ROOT, "movie-actors.json"),
      resolve(DATA_ROOT, "movie-actors.json"),
      syncMovieActor,
      bearer,
    )
    console.log(`Done — ${ok} updated, ${failed} failed/skipped`)
  }

  if (mode === "tv" || mode === "all") {
    console.log("\nSyncing TV actors…")
    const { ok, failed } = await syncFile(
      resolve(DATA_ROOT, "tv-actors.json"),
      resolve(DATA_ROOT, "tv-actors.json"),
      syncTvActor,
      bearer,
    )
    console.log(`Done — ${ok} updated, ${failed} failed/skipped`)
  }

  console.log("\nWrote updated files to", DATA_ROOT)
  console.log("Run `node scripts/generate-creditdle-pools.mjs` to regenerate answer pools.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
