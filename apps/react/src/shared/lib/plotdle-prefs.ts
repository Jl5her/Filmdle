const INCLUDE_ANIMATED_KEY = "filmdle-pref:plotdle:include-animated"

/** Whether "Next Plot" may land on animated films. Defaults to true. */
export function getIncludeAnimated(): boolean {
  try {
    return localStorage.getItem(INCLUDE_ANIMATED_KEY) !== "false"
  } catch {
    return true
  }
}

export function setIncludeAnimated(value: boolean): void {
  try {
    localStorage.setItem(INCLUDE_ANIMATED_KEY, String(value))
  } catch {
    // ignore
  }
}
