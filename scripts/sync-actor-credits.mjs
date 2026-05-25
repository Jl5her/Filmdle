#!/usr/bin/env node
// Resolves each curated actor's TMDB id + movie-credit ids and writes them
// back into packages/data/src/actordle/actors.json. Run once after curating
// new actors; result is committed so the daily-answer enrichment never has to
// hit TMDB at runtime.
//
// Reads the v4 bearer token from apps/react/.env.local (TMDB_BEARER=...).

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const ACTORS_PATH = resolve(ROOT, "packages/data/src/actordle/actors.json")
const ENV_PATH = resolve(ROOT, "apps/react/.env.local")

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

function pickMatch(results, name) {
  const lower = name.toLowerCase()
  const acting = results.filter((p) => p.known_for_department === "Acting")
  const exact = acting.find((p) => p.name.toLowerCase() === lower)
  if (exact) return exact
  return acting.sort((a, b) => b.popularity - a.popularity)[0] ?? results[0]
}

async function main() {
  const bearer = readBearer()
  const actors = JSON.parse(readFileSync(ACTORS_PATH, "utf-8"))

  let changed = 0
  let unchanged = 0
  let missing = 0

  for (const actor of actors) {
    process.stdout.write(`${actor.name.padEnd(28)} `)
    try {
      const search = await tmdb(
        `/search/person?query=${encodeURIComponent(actor.name)}&include_adult=false&page=1`,
        bearer,
      )
      const match = pickMatch(search.results ?? [], actor.name)
      if (!match) {
        console.log("✗ not found")
        missing += 1
        continue
      }
      const credits = await tmdb(`/person/${match.id}/movie_credits`, bearer)
      const filmIds = (credits.cast ?? []).map((c) => String(c.id))
      const same =
        actor.tmdbId === match.id && JSON.stringify(actor.filmIds) === JSON.stringify(filmIds)
      actor.tmdbId = match.id
      actor.filmIds = filmIds
      if (same) {
        console.log(`= tmdb:${match.id}, ${filmIds.length} films`)
        unchanged += 1
      } else {
        console.log(`✓ tmdb:${match.id}, ${filmIds.length} films`)
        changed += 1
      }
    } catch (err) {
      console.log(`✗ ${err.message}`)
      missing += 1
    }
    await new Promise((r) => setTimeout(r, 150))
  }

  writeFileSync(ACTORS_PATH, JSON.stringify(actors, null, 2) + "\n")
  console.log("")
  console.log(`Done — ${changed} updated, ${unchanged} unchanged, ${missing} missing`)
  console.log(`Wrote ${ACTORS_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
