import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { MainMenu } from "./shared/components/main-menu"

const ActordleGame = lazy(() => import("./games/actordle/screens/game"))
const FilmdleGame = lazy(() => import("./games/filmdle/screens/game"))
const MovieCreditGame = lazy(() => import("./games/creditdle/screens/movie-game"))
const TvCreditGame = lazy(() => import("./games/creditdle/screens/tv-game"))
const DebugCalendar = lazy(() => import("./shared/components/debug-calendar"))

// Debug routes are visible in `vite dev` and in any deploy that sets
// VITE_SHOW_DEBUG=true (e.g. Cloudflare Pages preview environments).
const showDebug = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEBUG === "true"

function MenuShell() {
  return (
    <div className="app-viewport">
      <MainMenu />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="app-viewport" />}>
        <Routes>
          <Route path="/" element={<MenuShell />} />
          <Route path="/actordle" element={<ActordleGame />} />
          <Route path="/filmdle" element={<FilmdleGame />} />
          <Route path="/creditdle" element={<MovieCreditGame />} />
          <Route path="/showdle" element={<TvCreditGame />} />
          {showDebug && <Route path="/debug/calendar" element={<DebugCalendar />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
