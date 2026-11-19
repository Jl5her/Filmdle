/**
 * Mobile keyboards cover the bottom of the page without shrinking `100dvh`
 * (iOS Safari always; Android only honours `interactive-widget`). Track the
 * visual viewport so the ticket can be sized to the area above the keyboard,
 * and flag `data-keyboard="open"` on <html> so screens can tighten their
 * layout while the player types.
 *
 * While the keyboard is open the app is pinned to the visual viewport (see
 * index.css) and follows its offset, instead of fighting iOS's own scrolling
 * with `scrollTo` — that tug-of-war is what made the view jump and jitter.
 */
export function installKeyboardViewport(): void {
  const vv = window.visualViewport
  if (!vv) return
  const root = document.documentElement
  // Tallest viewport seen with the keyboard closed. Reset on rotation.
  let fullHeight = Math.max(window.innerHeight, vv.height)
  let open = false
  let lastHeight = ""
  let lastTop = ""
  let frame = 0

  const update = () => {
    frame = 0
    if (!open) fullHeight = Math.max(fullHeight, window.innerHeight, vv.height)
    const isOpen = fullHeight - vv.height > 120 && isEditable(document.activeElement)

    if (isOpen) {
      const height = `${Math.round(vv.height)}px`
      const top = `${Math.round(Math.max(0, vv.offsetTop))}px`
      if (height !== lastHeight) {
        lastHeight = height
        root.style.setProperty("--app-height", height)
      }
      if (top !== lastTop) {
        lastTop = top
        root.style.setProperty("--app-top", top)
      }
    }

    if (isOpen !== open) {
      open = isOpen
      if (open) {
        root.dataset.keyboard = "open"
      } else {
        delete root.dataset.keyboard
        root.style.removeProperty("--app-height")
        root.style.removeProperty("--app-top")
        lastHeight = lastTop = ""
      }
    }
  }

  // Coalesce the burst of resize/scroll events iOS fires while the keyboard
  // animates into one style write per frame.
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }

  vv.addEventListener("resize", schedule)
  vv.addEventListener("scroll", schedule)
  window.addEventListener("focusin", schedule)
  window.addEventListener("focusout", () => setTimeout(schedule, 50))
  window.addEventListener("orientationchange", () => {
    fullHeight = 0
    setTimeout(schedule, 300)
  })
}

function isEditable(el: Element | null): boolean {
  if (!el) return false
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement)
    return !["button", "checkbox", "radio", "submit", "reset", "range", "color", "file"].includes(
      el.type,
    )
  return (el as HTMLElement).isContentEditable
}
