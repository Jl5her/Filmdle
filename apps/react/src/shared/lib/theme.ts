export type Theme = "auto" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "stardle-theme"

export function loadTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === "light" || v === "dark" || v === "auto") return v
  } catch {
    // ignore
  }
  return "auto"
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== "auto") return theme
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", resolved === "dark")
}
