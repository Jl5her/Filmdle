export function todayKey(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function computeAge(dob: string, now = new Date()): number {
  const [y, m, d] = dob.split("-").map(Number) as [number, number, number]
  let age = now.getFullYear() - y
  const beforeBirthday =
    now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)
  if (beforeBirthday) age -= 1
  return age
}

export function formatLongDate(now = new Date()): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
