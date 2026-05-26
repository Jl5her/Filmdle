import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { MainMenu } from "./shared/components/main-menu"

const ActordleGame = lazy(() => import("./games/actordle/screens/game"))
const FilmdleGame = lazy(() => import("./games/filmdle/screens/game"))
const DebugCalendar = lazy(() => import("./shared/components/debug-calendar"))

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
          {import.meta.env.DEV && <Route path="/debug/calendar" element={<DebugCalendar />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
