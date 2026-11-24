#!/usr/bin/env node
// Appends newly generated plots to the Plotdle pool.
//
//   node scripts/plotdle/add-plots.mjs new-plots.json [--shuffle] [--arcade | --library]
//
// Input is a JSON array in the shape generation-prompt.md asks for:
//   { plot, character, genre, title, year, animated, difficulty }
// Plots are validated, de-duplicated against the pool (same title + year),
// and given the next puzzle numbers. Existing ids are never changed, so
// shared /plotdle/<id> links stay valid. --shuffle mixes the new batch so
// eras and difficulties don't come in runs. New plots join the daily queue
// (released one per day after the existing dailies) unless --arcade is
// passed, which makes them playable right away from Play Again, or --library,
// which keeps them out of both: they can only be looked up and played by link.
// Afterwards run sync-tmdb.mjs.

import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const POOL = resolve(import.meta.dirname, "../../packages/data/src/plotdle/plots.json")
const DIFFICULTIES = new Set(["easy", "medium", "hard"])
const GENRES = new Set(
  "Action Adventure Animation Comedy Crime Documentary Drama Family Fantasy History Horror Music Mystery Romance Thriller War Western"
    .split(" ")
    .concat("Science Fiction"),
)
const STOPWORDS = new Set(
  "the a an of and in on to for with at by from is it his her my your our their part ii iii iv who one".split(
    " ",
  ),
)

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
const keyOf = (p) => `${norm(p.title)}:${p.year}`

function fnv1a(input) {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

const [input, ...flags] = process.argv.slice(2)
if (!input) {
  console.error(
    "usage: node scripts/plotdle/add-plots.mjs <new-plots.json> [--shuffle] [--arcade | --library]",
  )
  process.exit(1)
}

let pool = []
try {
  pool = JSON.parse(readFileSync(POOL, "utf-8"))
} catch {
  // first run: empty pool
}
const incoming = JSON.parse(readFileSync(input, "utf-8"))
const seen = new Set(pool.map(keyOf))
const seenTitles = new Map(pool.map((p) => [norm(p.title), p.year]))
let nextId = pool.reduce((m, p) => Math.max(m, p.id), 0) + 1

const accepted = []
const problems = []
for (const p of incoming) {
  const where = `${p.title} (${p.year})`
  if (typeof p.plot !== "string" || !p.plot.trim() || typeof p.title !== "string") {
    problems.push(`skip  ${where}: missing plot/title`)
    continue
  }
  if (!Number.isInteger(p.year)) {
    problems.push(`skip  ${where}: bad year`)
    continue
  }
  if (typeof p.character !== "string" || !p.character.trim()) {
    problems.push(`skip  ${where}: missing character hint`)
    continue
  }
  if (!GENRES.has(p.genre)) problems.push(`warn  ${where}: unknown genre "${p.genre}"`)
  if (seen.has(keyOf(p))) {
    problems.push(`skip  ${where}: already in pool`)
    continue
  }
  const plot = p.plot
    .trim()
    .replace(/\s*\(animated\)\s*$/i, "")
    .replace(/\.$/, "")
  const plotWords = new Set(norm(`${plot} ${p.character}`).split(" "))
  const leaked = norm(p.title)
    .split(" ")
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && plotWords.has(w))
  if (leaked.length) problems.push(`warn  ${where}: title word(s) in plot: ${leaked.join(", ")}`)
  if (seenTitles.has(norm(p.title)))
    problems.push(`warn  ${where}: same title as ${seenTitles.get(norm(p.title))} entry (remake?)`)
  seen.add(keyOf(p))
  seenTitles.set(norm(p.title), p.year)
  accepted.push({
    plot,
    title: p.title.trim(),
    year: p.year,
    animated: Boolean(p.animated) || /\(animated\)\s*$/i.test(p.plot),
    difficulty: DIFFICULTIES.has(p.difficulty) ? p.difficulty : "medium",
    character: p.character.trim().replace(/\.$/, ""),
    genre: p.genre,
    pool: flags.includes("--library") ? "library" : flags.includes("--arcade") ? "arcade" : "daily",
    tmdbId: Number.isInteger(p.tmdbId) ? p.tmdbId : 0,
  })
}

if (flags.includes("--shuffle")) {
  // Deterministic shuffle so re-running on the same input gives the same order.
  accepted.sort((a, b) => fnv1a(keyOf(a)) - fnv1a(keyOf(b)))
}
const added = accepted.map((p) => ({ id: nextId++, ...p }))
const out = [...pool, ...added]
writeFileSync(POOL, `[\n${out.map((p) => `  ${JSON.stringify(p)}`).join(",\n")}\n]\n`)

for (const line of problems) console.log(line)
console.log(
  `\nAdded ${added.length} plots (ids ${added[0]?.id ?? "-"}–${added.at(-1)?.id ?? "-"}). Pool size: ${out.length}.`,
)
const dailies = out.filter((p) => p.pool === "daily").length
console.log(`Daily queue: ${dailies} plots (${dailies} days from launch).`)
console.log("Next: node scripts/plotdle/sync-tmdb.mjs")
