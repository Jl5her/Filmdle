import { daysBetween } from "./date"
import { minHashPick } from "./hash"

/**
 * First day each game follows its fixed rotation. Before this date the
 * daily answer was a fresh random pick each day (which repeated often);
 * those days keep their original answers so saved games and stats still
 * match. Must be no earlier than the day the rotation ships: if a release
 * slips past it, move it forward.
 */
export const ROTATION_START: Record<string, string> = {
  actordle: "2026-12-01",
  filmdle: "2026-12-01",
  creditdle: "2026-12-01",
  showdle: "2026-12-01",
}

/**
 * Today's answer. From ROTATION_START on, day N is item N of the answer
 * pool in file order, so nothing repeats until the whole pool has been
 * used. Pools are append-only: new answers go at the end of the file and
 * never shift a day that has already been played.
 */
export function pickDaily<T>(
  gameKey: string,
  items: T[],
  idOf: (item: T) => string,
  dateKey: string,
): T {
  const start = ROTATION_START[gameKey]
  if (!start || dateKey < start) return minHashPick(items, idOf, `${gameKey}:${dateKey}`)
  const day = daysBetween(start, dateKey)
  return items[day % items.length] as T
}
