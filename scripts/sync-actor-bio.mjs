#!/usr/bin/env node
// Refreshes each curated actor's nationality (from TMDB place_of_birth) and
// debutYear (earliest cast release_date) in packages/data/src/actordle/actors.json.
// Run after adding new actors or when TMDB data has changed.
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

const COUNTRY_ALIASES = {
  "United States of America": "USA",
  "United States": "USA",
  "U.S.": "USA",
  "U.S.A.": "USA",
  "United Kingdom": "UK",
  "U.K.": "UK",
}

function nationalityFromPlaceOfBirth(place) {
  if (!place) return null
  const parts = place
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const last = parts[parts.length - 1]
  if (!last) return null
  return COUNTRY_ALIASES[last] ?? last
}

function debutYearFromCredits(cast) {
  let earliest = null
  for (const c of cast ?? []) {
    if (!c.release_date) continue
    const year = Number(c.release_date.slice(0, 4))
    if (!year || year < 1900) continue
    if (earliest === null || year < earliest) earliest = year
  }
  return earliest
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
      if (!actor.tmdbId) {
        console.log("✗ no tmdbId — run sync-actor-credits.mjs first")
        missing += 1
        continue
      }
      const [details, credits] = await Promise.all([
        tmdb(`/person/${actor.tmdbId}`, bearer),
        tmdb(`/person/${actor.tmdbId}/movie_credits`, bearer),
      ])
      const nationality = nationalityFromPlaceOfBirth(details.place_of_birth) ?? actor.nationality
      const debutYear = debutYearFromCredits(credits.cast) ?? actor.debutYear
      const same = actor.nationality === nationality && actor.debutYear === debutYear
      actor.nationality = nationality
      actor.debutYear = debutYear
      if (same) {
        console.log(`= ${nationality}, debut ${debutYear}`)
        unchanged += 1
      } else {
        console.log(`✓ ${nationality}, debut ${debutYear}`)
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
