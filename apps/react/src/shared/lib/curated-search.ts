import Fuse, { type IFuseOptions } from "fuse.js"

/**
 * Build a typo-tolerant index over a curated dataset (e.g. the
 * Filmdle/Actordle answer pool) so the autocomplete dropdown can
 * surface "did you mean…?" matches without round-tripping TMDB.
 */
export function buildCuratedSearch<T extends { id: string }>(
  items: T[],
  nameKey: keyof T & string,
  extraOptions: Partial<IFuseOptions<T>> = {},
) {
  const fuse = new Fuse(items, {
    keys: [nameKey],
    // Lower threshold = stricter match. 0.4 admits things like
    // "godfaher" → "Godfather" but rejects unrelated strings.
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
    ...extraOptions,
  })
  const byId = new Map(items.map((item) => [item.id, item]))
  return {
    search(query: string, limit = 5): T[] {
      const trimmed = query.trim()
      if (trimmed.length < 2) return []
      return fuse.search(trimmed, { limit }).map((r) => r.item)
    },
    get(id: string): T | undefined {
      return byId.get(id)
    },
  }
}

/**
 * Normalises a title/name for cross-source dedupe between curated and
 * TMDB suggestions. Strips diacritics, punctuation and case so that
 * "The Godfather" and "the godfather" collapse to the same key.
 */
export function normaliseName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}
