/**
 * Code 39 barcode layout. Each character is 9 elements (bar, space, bar,
 * …) of which 3 are wide; characters are separated by a narrow gap and
 * the whole code is wrapped in "*" start/stop characters.
 */
const PATTERNS: Record<string, string> = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  "-": "nwnnnnwnw",
  "*": "nwnnwnwnn",
}

const NARROW = 1
const WIDE = 2.5

export interface Bar {
  /** Offset from the start of the code, in narrow-module units. */
  at: number
  size: number
}

/** Bars for `text` (digits and "-"; anything else is dropped). */
export function code39Bars(text: string): { bars: Bar[]; length: number } {
  const chars = `*${[...text].filter((c) => c in PATTERNS && c !== "*").join("")}*`
  const bars: Bar[] = []
  let pos = 0
  for (const [ci, c] of [...chars].entries()) {
    const pattern = PATTERNS[c] ?? ""
    for (const [i, e] of [...pattern].entries()) {
      const size = e === "w" ? WIDE : NARROW
      if (i % 2 === 0) bars.push({ at: pos, size })
      pos += size
    }
    if (ci < chars.length - 1) pos += NARROW
  }
  return { bars, length: pos }
}
