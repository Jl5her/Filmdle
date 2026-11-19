import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { LoadingTicket } from "./shared/components/loading-ticket"
import { MainMenu } from "./shared/components/main-menu"
import { gameLoaders } from "./shared/lib/game-loaders"

const ActordleGame = lazy(gameLoaders.actordle)
const FilmdleGame = lazy(gameLoaders.filmdle)
const MovieCreditGame = lazy(gameLoaders.creditdle)
const TvCreditGame = lazy(gameLoaders.showdle)
const PlotdleGame = lazy(gameLoaders.plotdle)
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
      <Suspense fallback={<LoadingTicket />}>
        <Routes>
          <Route path="/" element={<MenuShell />} />
          <Route path="/actordle" element={<ActordleGame />} />
          <Route path="/filmdle" element={<FilmdleGame />} />
          <Route path="/creditdle" element={<MovieCreditGame />} />
          <Route path="/showdle" element={<TvCreditGame />} />
          <Route path="/plotdle" element={<PlotdleGame />} />
          <Route path="/plotdle/:id" element={<PlotdleGame />} />
          {showDebug && <Route path="/debug/calendar" element={<DebugCalendar />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
