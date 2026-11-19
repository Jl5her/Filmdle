// Dynamic imports for each game screen, shared by the router's lazy() and by
// the menu's idle prefetch so opening a game doesn't flash an empty ticket.
export const gameLoaders = {
  actordle: () => import("@/games/actordle/screens/game"),
  filmdle: () => import("@/games/filmdle/screens/game"),
  creditdle: () => import("@/games/creditdle/screens/movie-game"),
  showdle: () => import("@/games/creditdle/screens/tv-game"),
  plotdle: () => import("@/games/plotdle/screens/game"),
}

let prefetched = false

/** Warm every game chunk once the browser is idle. Safe to call repeatedly. */
export function prefetchGames(): void {
  if (prefetched) return
  prefetched = true
  const run = () => {
    for (const load of Object.values(gameLoaders)) load().catch(() => {})
  }
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 3000 })
  else setTimeout(run, 1500)
}
