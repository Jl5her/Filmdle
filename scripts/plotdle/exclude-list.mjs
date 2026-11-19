#!/usr/bin/env node
// Prints the titles already in the Plotdle pool, for the {{EXCLUDE_TITLES}}
// slot in generation-prompt.md. Run: node scripts/plotdle/exclude-list.mjs
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const path = resolve(import.meta.dirname, "../../packages/data/src/plotdle/plots.json")
const plots = JSON.parse(readFileSync(path, "utf-8"))
console.log(plots.map((p) => `${p.title} (${p.year})`).join("; "))
