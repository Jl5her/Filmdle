export function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

export function minHashPick<T>(items: T[], idOf: (item: T) => string, seed: string): T {
  if (items.length === 0) throw new Error("minHashPick: empty items")
  let bestHash = Number.POSITIVE_INFINITY
  let best = items[0] as T
  for (const item of items) {
    const h = fnv1a(`${seed}:${idOf(item)}`)
    if (h < bestHash) {
      bestHash = h
      best = item
    }
  }
  return best
}
