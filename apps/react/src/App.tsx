import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ErrorBoundary } from "./shared/components/error-boundary"
import { LoadingTicket } from "./shared/components/loading-ticket"
import { MainMenu } from "./shared/components/main-menu"
import { gameLoaders } from "./shared/lib/game-loaders"

const ActordleGame = lazy(gameLoaders.actordle)
const FilmdleGame = lazy(gameLoaders.filmdle)
const MovieCreditGame = lazy(gameLoaders.creditdle)
const TvCreditGame = lazy(gameLoaders.showdle)
const PlotdleGame = lazy(gameLoaders.plotdle)
const DebugCalendar = lazy(() => import("./shared/components/debug-calendar"))
const DebugPlots = lazy(() => import("./shared/components/debug-plots"))

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
      <ErrorBoundary>
        <Suspense fallback={<LoadingTicket />}>
          <Routes>
            <Route path="/" element={<MenuShell />} />
            <Route path="/actordle" element={<ActordleGame />} />
            <Route path="/filmdle" element={<FilmdleGame />} />
            <Route path="/creditdle" element={<MovieCreditGame />} />
            <Route path="/showdle" element={<TvCreditGame />} />
            <Route path="/plotdle" element={<PlotdleGame />} />
            <Route path="/plotdle/:id" element={<PlotdleGame />} />
            <Route path="/debug/calendar" element={<DebugCalendar />} />
            <Route path="/debug/plots" element={<DebugPlots />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
