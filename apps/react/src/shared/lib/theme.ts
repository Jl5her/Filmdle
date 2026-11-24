export type Theme = "auto" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "stardle-theme"
export const DESIGN_STORAGE_KEY = "stardle-design"
export const COLORBLIND_STORAGE_KEY = "stardle-colorblind"

/** Color-blind mode swaps green/yellow/red for blue/orange/gray (see index.css). */
export function loadColorblind(): boolean {
  try {
    return localStorage.getItem(COLORBLIND_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function saveColorblind(on: boolean): void {
  try {
    if (on) localStorage.setItem(COLORBLIND_STORAGE_KEY, "1")
    else localStorage.removeItem(COLORBLIND_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function applyColorblind(on: boolean): void {
  if (typeof document === "undefined") return
  if (on) document.documentElement.dataset.colorblind = ""
  else delete document.documentElement.dataset.colorblind
}

export function isColorblind(): boolean {
  return typeof document !== "undefined" && "colorblind" in document.documentElement.dataset
}

/** Visual style of the whole app. Colors, fonts and the frame come from CSS keyed on data-design. */
export type Design = "ticket" | "cinema" | "modern"

export function loadDesign(): Design {
  try {
    const v = localStorage.getItem(DESIGN_STORAGE_KEY)
    if (v === "ticket" || v === "cinema" || v === "modern") return v
  } catch {
    // ignore
  }
  return "ticket"
}

export function saveDesign(design: Design): void {
  try {
    localStorage.setItem(DESIGN_STORAGE_KEY, design)
  } catch {
    // ignore
  }
}

export function applyDesign(design: Design): void {
  if (typeof document === "undefined") return
  document.documentElement.dataset.design = design
}

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
