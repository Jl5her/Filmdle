import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { ThemeProvider } from "./shared/lib/theme-context"
import "./index.css"

// Desktop-only: feed the cursor position into CSS vars (--mx, --my) so
// the spotlight overlay defined in index.css follows the mouse. rAF
// throttling keeps this cheap; the listener no-ops on touch devices.
if (
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches
) {
  let pending = 0
  let lastX = 0
  let lastY = 0
  const root = document.documentElement
  window.addEventListener(
    "mousemove",
    (e) => {
      lastX = e.clientX
      lastY = e.clientY
      if (pending) return
      pending = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${lastX}px`)
        root.style.setProperty("--my", `${lastY}px`)
        pending = 0
      })
    },
    { passive: true },
  )
}

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("Root element not found")

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
