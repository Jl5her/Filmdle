import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  applyDesign,
  applyResolvedTheme,
  type Design,
  loadDesign,
  loadTheme,
  resolveTheme,
  saveDesign,
  saveTheme,
  type Theme,
} from "./theme"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  design: Design
  setDesign: (design: Design) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => loadTheme())
  const [design, setDesignState] = useState<Design>(() => loadDesign())

  useEffect(() => {
    applyDesign(design)
    saveDesign(design)
  }, [design])

  useEffect(() => {
    applyResolvedTheme(resolveTheme(theme))
    saveTheme(theme)

    if (theme !== "auto") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyResolvedTheme(resolveTheme("auto"))
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])
  const setDesign = useCallback((next: Design) => setDesignState(next), [])
  const value = useMemo(
    () => ({ theme, setTheme, design, setDesign }),
    [theme, setTheme, design, setDesign],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
