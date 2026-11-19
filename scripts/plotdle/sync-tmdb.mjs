#!/usr/bin/env node
// Resolves each Plotdle plot to its TMDB movie id so guesses picked from the
// TMDB autocomplete are matched by id, not just by title + year.
// Only plots with tmdbId 0 are looked up; pass --all to re-check every plot.
//
// Reads TMDB_BEARER from apps/react/.env.local.
// Run: node scripts/plotdle/sync-tmdb.mjs [--all]

import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "../..")
const POOL = resolve(ROOT, "packages/data/src/plotdle/plots.json")
const ENV_PATH = resolve(ROOT, "apps/react/.env.local")

function readBearer() {
  let env
  try {
    env = readFileSync(ENV_PATH, "utf-8")
  } catch {
    throw new Error(`Missing ${ENV_PATH}: needs a line TMDB_BEARER=...`)
  }
  const m = env.match(/^TMDB_BEARER=(.+)$/m)
  if (!m) throw new Error(`No TMDB_BEARER line in ${ENV_PATH}`)
  return m[1].trim()
}

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
const yearOf = (r) => (r.release_date ? Number(r.release_date.slice(0, 4)) : 0)

async function search(title, year, bearer) {
  const q = `/search/movie?query=${encodeURIComponent(title)}&include_adult=false&page=1`
  const res = await fetch(`https://api.themoviedb.org/3${q}`, {
    headers: { Authorization: `Bearer ${bearer}`, Accept: "application/json" },
  })
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000))
    return search(title, year, bearer)
  }
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${title}`)
  return (await res.json()).results ?? []
}

function pick(results, title, year) {
  const near = (r, d) => Math.abs(yearOf(r) - year) <= d
  const byVotes = (a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)
  const sameTitle = results.filter(
    (r) => norm(r.title) === norm(title) || norm(r.original_title ?? "") === norm(title),
  )
  return (
    sameTitle.filter((r) => near(r, 0)).sort(byVotes)[0] ??
    sameTitle.filter((r) => near(r, 1)).sort(byVotes)[0] ??
    results.filter((r) => near(r, 1)).sort(byVotes)[0] ??
    null
  )
}

async function main() {
  const all = process.argv.includes("--all")
  const bearer = readBearer()
  const plots = JSON.parse(readFileSync(POOL, "utf-8"))
  let resolved = 0
  const review = []
  for (const p of plots) {
    if (p.tmdbId && !all) continue
    const hit = pick(await search(p.title, p.year, bearer), p.title, p.year)
    if (!hit) {
      review.push(`✗ #${p.id} ${p.title} (${p.year}): no match`)
    } else {
      if (norm(hit.title) !== norm(p.title) || yearOf(hit) !== p.year)
        review.push(
          `? #${p.id} ${p.title} (${p.year}) → ${hit.title} (${yearOf(hit)}) tmdb:${hit.id}`,
        )
      p.tmdbId = hit.id
      resolved++
    }
    await new Promise((r) => setTimeout(r, 60))
  }
  writeFileSync(POOL, `[\n${plots.map((p) => `  ${JSON.stringify(p)}`).join(",\n")}\n]\n`)
  console.log(review.join("\n"))
  console.log(`\nResolved ${resolved}. ${review.length} need a look (✗ unresolved, ? fuzzy match).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
