// Renders the app icons and link-preview image in apps/react/public from
// icon.html and og.html. Needs Playwright with Chromium; run from this folder:
//   node render.js ../../apps/react/public
// The PNGs in public/ were then reduced to 256 colours to keep them small.
const { chromium } = require("playwright")
const fs = require("node:fs")
const out = process.argv[2]
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage()
  const src = fs.readFileSync("icon.html", "utf8")
  for (const [name, size, scale] of [
    ["apple-touch-icon.png", 180, "1"],
    ["icon-192.png", 192, "1"],
    ["icon-512.png", 512, "1"],
    ["icon-maskable-512.png", 512, "0.78"],
  ]) {
    await p.setViewportSize({ width: size, height: size })
    await p.setContent(
      src
        .replace("SCALE", scale)
        .replace('width="512" height="512"', `width="${size}" height="${size}"`),
    )
    await p.locator("#i").screenshot({ path: `${out}/${name}`, omitBackground: true })
  }
  await p.setViewportSize({ width: 1200, height: 630 })
  await p.setContent(fs.readFileSync("og.html", "utf8"), { waitUntil: "networkidle" })
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({ path: `${out}/og-image.png` })
  await b.close()
})()
