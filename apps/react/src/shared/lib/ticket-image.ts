import { code39Bars } from "./code39"
import { formatSerial } from "./date"
import { isColorblind } from "./theme"

export interface TicketImageData {
  /** Game name printed as the ticket's title, e.g. "Plotdle". */
  game: string
  mode: "daily" | "arcade"
  serial?: number
  /** One entry per guess: true for the correct one. */
  marks: boolean[]
  maxGuesses: number
  won: boolean
  /** Day of the puzzle (YYYY-MM-DD); defaults to today. Set for archive plays. */
  dateKey?: string
  /** Optional quote printed on the ticket (Plotdle's plot). Never the answer. */
  quote?: string
}

const W = 1080
const H = 1350

/** Colors come from the ticket on screen, so the image matches the player's theme and game. */
function palette() {
  const el = document.querySelector(".app-viewport") ?? document.documentElement
  const css = getComputedStyle(el)
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  return {
    paper: v("--ticket-paper", "#faf3e0"),
    stub: v("--ticket-stub", "#f1e3bd"),
    ink: v("--ticket-ink", "#2a1810"),
    red: v("--ticket-red", "#b9281e"),
    rule: v("--ticket-rule", "#d0786f"),
    bg: v("--theater-bg", "#2e1f10"),
    win: isColorblind() ? "#1f6fbf" : "#5e7a2c",
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Draws the finished game as a ticket stub and returns it as a PNG. */
export async function renderTicketImage(t: TicketImageData): Promise<Blob> {
  await Promise.all(
    ["120px Anton", "600 44px Geist", "400 44px Geist"].map((f) =>
      document.fonts.load(f).catch(() => undefined),
    ),
  )
  const c = palette()
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unavailable")
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"

  // Backdrop and ticket card.
  const x = 90
  const y = 80
  const w = W - 2 * x
  const h = H - 2 * y
  const stubH = 290
  const tearY = y + h - stubH
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = c.paper
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = c.stub
  ctx.fillRect(x, tearY, w, stubH)

  // Notched corners, tear notches and punched perforation.
  ctx.fillStyle = c.bg
  const hole = (cx: number, cy: number, r: number) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  for (const [cx, cy] of [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ] as const)
    hole(cx, cy, 34)
  hole(x, tearY, 44)
  hole(x + w, tearY, 44)
  for (let px = x + 70; px <= x + w - 70; px += 30) hole(px, tearY, 7)

  // Printed double rule around the body.
  ctx.strokeStyle = c.rule
  ctx.lineWidth = 3
  ctx.strokeRect(x + 30, y + 30, w - 60, tearY - y - 76)
  ctx.lineWidth = 1.5
  ctx.strokeRect(x + 40, y + 40, w - 80, tearY - y - 96)

  // Header: ADMIT ONE, title, fields.
  ctx.fillStyle = c.red
  ctx.font = "34px Anton, Impact, sans-serif"
  ctx.letterSpacing = "8px"
  ctx.fillText("★  ADMIT ONE  ★", W / 2, y + 120)
  ctx.font = "130px Anton, Impact, sans-serif"
  ctx.letterSpacing = "6px"
  ctx.fillText(t.game.toUpperCase(), W / 2, y + 265)
  ctx.letterSpacing = "4px"
  ctx.font = "600 30px Geist, system-ui, sans-serif"
  ctx.fillStyle = c.ink
  const day = t.dateKey ? new Date(`${t.dateKey}T12:00:00`) : new Date()
  const date = day.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const no = t.serial !== undefined ? `№ ${formatSerial(t.serial)}` : "FREE PLAY"
  ctx.fillText(
    `${date.toUpperCase()}   ·   ${t.mode === "arcade" ? "ARCADE" : "DAILY"} ${no}`,
    W / 2,
    y + 330,
  )
  ctx.fillStyle = c.rule
  ctx.fillRect(x + 80, y + 365, w - 160, 2)

  // The plot (or a blank line of space when there's no quote).
  let cursor = y + 450
  if (t.quote) {
    ctx.letterSpacing = "0px"
    ctx.fillStyle = c.ink
    ctx.font = "400 44px Geist, system-ui, sans-serif"
    const lines = wrap(ctx, `“${t.quote}”`, w - 180).slice(0, 5)
    for (const line of lines) {
      ctx.fillText(line, W / 2, cursor)
      cursor += 60
    }
    cursor += 30
  } else {
    cursor += 60
  }

  // One mark per guess slot: ✓ correct, ✕ wrong, ring unused.
  const r = 34
  const gap = 28
  const rowW = t.maxGuesses * 2 * r + (t.maxGuesses - 1) * gap
  const markY = Math.max(cursor + r, y + 640)
  for (let i = 0; i < t.maxGuesses; i++) {
    const cx = W / 2 - rowW / 2 + r + i * (2 * r + gap)
    const m = t.marks[i]
    ctx.beginPath()
    ctx.arc(cx, markY, r, 0, Math.PI * 2)
    if (m === undefined) {
      ctx.strokeStyle = c.rule
      ctx.lineWidth = 4
      ctx.stroke()
      continue
    }
    ctx.fillStyle = m ? c.win : c.red
    ctx.fill()
    ctx.fillStyle = "#fffaf0"
    ctx.font = "600 40px Geist, system-ui, sans-serif"
    ctx.letterSpacing = "0px"
    ctx.fillText(m ? "✓" : "✕", cx, markY + 14)
  }
  const used = t.marks.length

  // Stamp.
  ctx.save()
  ctx.translate(W / 2, markY + r + 72)
  ctx.rotate((-12 * Math.PI) / 180)
  ctx.globalAlpha = 0.85
  ctx.strokeStyle = t.won ? c.red : c.ink
  ctx.fillStyle = t.won ? c.red : c.ink
  ctx.lineWidth = 5
  ctx.font = "44px Anton, Impact, sans-serif"
  ctx.letterSpacing = "6px"
  const stamp = t.won ? "ADMITTED" : "NO ENTRY"
  const sw = ctx.measureText(stamp).width + 36
  ctx.strokeRect(-sw / 2, -42, sw, 64)
  ctx.fillText(stamp, 0, 6)
  ctx.restore()

  // Stub: ADMIT ONE up the side, barcode, call to play.
  ctx.save()
  ctx.translate(x + 50, tearY + stubH / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = c.red
  ctx.font = "30px Anton, Impact, sans-serif"
  ctx.letterSpacing = "6px"
  ctx.fillText("ADMIT ONE", 0, 10)
  ctx.restore()

  const { bars, length } = code39Bars(t.serial !== undefined ? formatSerial(t.serial) : "0")
  const barH = 200
  const scale = barH / length
  ctx.fillStyle = c.ink
  for (const b of bars)
    ctx.fillRect(x + w - 80, tearY + (stubH - barH) / 2 + b.at * scale, 34, b.size * scale)

  ctx.fillStyle = c.ink
  ctx.letterSpacing = "4px"
  ctx.font = "600 40px Geist, system-ui, sans-serif"
  ctx.fillText(
    t.won ? `GOT IT IN ${used}/${t.maxGuesses}` : `MISSED IT · X/${t.maxGuesses}`,
    W / 2,
    tearY + 125,
  )
  ctx.font = "400 32px Geist, system-ui, sans-serif"
  ctx.letterSpacing = "1px"
  ctx.fillText(
    `${t.won ? "Can you beat me?" : "Can you get it?"}  ${window.location.host}`,
    W / 2,
    tearY + 185,
  )

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't draw ticket"))), "image/png"),
  )
}

/** Shares the ticket image where the device can, otherwise downloads it. */
export async function shareTicketImage(
  t: TicketImageData,
  shareText?: string,
): Promise<"shared" | "saved" | "cancelled"> {
  const blob = await renderTicketImage(t)
  const name = `${t.game.toLowerCase()}-${t.serial !== undefined ? formatSerial(t.serial) : "arcade"}.png`
  const file = new File([blob], name, { type: "image/png" })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: shareText })
      return "shared"
    } catch (err) {
      if ((err as Error).name === "AbortError") return "cancelled"
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return "saved"
}
