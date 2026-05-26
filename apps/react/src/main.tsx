import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { ThemeProvider } from "./shared/lib/theme-context"
import "./index.css"

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("Root element not found")

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
