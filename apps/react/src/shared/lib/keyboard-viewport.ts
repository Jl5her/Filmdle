import { useSyncExternalStore } from "react"

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
  let closingTimer = 0

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
      window.clearTimeout(closingTimer)
      if (open) {
        delete root.dataset.keyboardClosing
        root.dataset.keyboard = "open"
      } else {
        // Flagged in the same frame the keyboard layout goes, so the ticket
        // animates back to full height (index.css) rather than jumping.
        root.dataset.keyboardClosing = ""
        closingTimer = window.setTimeout(() => delete root.dataset.keyboardClosing, 400)
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

  // While the keyboard is open, iOS lets any drag pan the page behind the
  // pinned app; following that pan a frame late is what glitches. Only let
  // touches scroll an inner area that can actually scroll that way (the guess
  // grid, the suggestions list, a panel on a small phone); block the rest.
  let startX = 0
  let startY = 0
  document.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0]
      if (t) {
        startX = t.clientX
        startY = t.clientY
      }
    },
    { passive: true },
  )
  document.addEventListener(
    "touchmove",
    (e) => {
      if (!open || e.touches.length !== 1) return
      const t = e.touches[0]
      if (!t) return
      const target = e.target instanceof Element ? e.target : null
      // Dragging inside the text box moves the caret; leave it alone.
      if (target && target === document.activeElement && isEditable(target)) return
      if (!canScroll(target, t.clientX - startX, t.clientY - startY)) e.preventDefault()
    },
    { passive: false },
  )

  vv.addEventListener("resize", schedule)
  vv.addEventListener("scroll", schedule)
  window.addEventListener("focusin", schedule)
  window.addEventListener("focusout", () => setTimeout(schedule, 50))
  window.addEventListener("orientationchange", () => {
    fullHeight = 0
    setTimeout(schedule, 300)
  })
}

/**
 * Whether a drag of (dx, dy) would scroll some element between `el` and the
 * page, rather than run past its end (which iOS hands on to the page).
 */
function canScroll(el: Element | null, dx: number, dy: number): boolean {
  const vertical = Math.abs(dy) >= Math.abs(dx)
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    if (!(node instanceof HTMLElement)) continue
    const style = getComputedStyle(node)
    if (vertical) {
      const scrolls = /(auto|scroll)/.test(style.overflowY)
      if (!scrolls || node.scrollHeight <= node.clientHeight + 1) continue
      const atTop = node.scrollTop <= 0
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1
      // Dragging down scrolls toward the top, and vice versa.
      return dy > 0 ? !atTop : !atBottom
    }
    const scrolls = /(auto|scroll)/.test(style.overflowX)
    if (!scrolls || node.scrollWidth <= node.clientWidth + 1) continue
    const atStart = node.scrollLeft <= 0
    const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 1
    return dx > 0 ? !atStart : !atEnd
  }
  return false
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

function subscribeKeyboard(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-keyboard"],
  })
  return () => observer.disconnect()
}

/** True while the on-screen keyboard is open (see installKeyboardViewport). */
export function useKeyboardOpen(): boolean {
  return useSyncExternalStore(
    subscribeKeyboard,
    () => document.documentElement.dataset.keyboard === "open",
    () => false,
  )
}
