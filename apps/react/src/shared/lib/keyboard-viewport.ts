/**
 * Mobile keyboards cover the bottom of the page without shrinking `100dvh`
 * (iOS Safari always; Android only honours `interactive-widget`). Track the
 * visual viewport so the ticket can be sized to the area above the keyboard,
 * and flag `data-keyboard="open"` on <html> so screens can tighten their
 * layout while the player types.
 */
export function installKeyboardViewport(): void {
  const vv = window.visualViewport
  if (!vv) return
  const root = document.documentElement
  // Tallest viewport seen with the keyboard closed. Reset on rotation.
  let fullHeight = Math.max(window.innerHeight, vv.height)
  let open = false

  const update = () => {
    if (!open) fullHeight = Math.max(fullHeight, window.innerHeight, vv.height)
    const isOpen = fullHeight - vv.height > 120 && isEditable(document.activeElement)
    if (isOpen !== open) {
      open = isOpen
      if (open) root.dataset.keyboard = "open"
      else delete root.dataset.keyboard
    }
    if (open) {
      root.style.setProperty("--app-height", `${Math.round(vv.height)}px`)
      // iOS scrolls the page to reveal the focused input; the ticket now
      // fits the visible area, so pin it back to the top.
      if (window.scrollY !== 0) window.scrollTo(0, 0)
    } else {
      root.style.removeProperty("--app-height")
    }
  }

  vv.addEventListener("resize", update)
  vv.addEventListener("scroll", update)
  window.addEventListener("focusin", () => requestAnimationFrame(update))
  window.addEventListener("focusout", () => setTimeout(update, 50))
  window.addEventListener("orientationchange", () => {
    fullHeight = 0
    open = false
    setTimeout(update, 300)
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
