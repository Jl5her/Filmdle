import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilmIcon } from "./film-icon"
import { GameModeButton } from "./game-mode-button"
import { SettingsOverlay } from "./settings-overlay"
import { StatsOverlay } from "./stats-overlay"
import { formatLongDate } from "@/shared/lib/date"

export function MainMenu() {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)

  return (
    <div className="flex flex-col items-center flex-1 w-full px-4 pt-10 pb-8">
      <div className="text-center">
        <FilmIcon
          className="mx-auto mb-3 w-16 h-16 text-secondary-500"
          title="Filmdle"
        />
        <h1 className="fa5-title text-6xl text-primary-900 dark:text-primary-50">
          FILMDLE
        </h1>
        <p className="text-base sm:text-lg font-semibold text-primary-600 dark:text-primary-300 mt-2">
          A daily film-trivia guessing game.
        </p>
      </div>

      <div className="w-full max-w-xs mt-10 flex flex-col gap-3">
        <GameModeButton
          label="Actordle"
          sublabel="Guess the famous actor in 5 tries"
          onClick={() => navigate("/actordle")}
        />
        <GameModeButton
          label="Filmdle"
          sublabel="Guess the famous film in 5 tries"
          onClick={() => navigate("/filmdle")}
        />
        <div className="flex justify-center gap-2 mt-3">
          <MenuIconButton icon="📊" label="Stats" onClick={() => setStatsOpen(true)} />
          <MenuIconButton icon="⚙" label="Settings" onClick={() => setSettingsOpen(true)} />
        </div>
      </div>

      <p className="text-xs text-primary-500 dark:text-primary-400 text-center mt-auto pt-10">
        {formatLongDate()}
      </p>

      <StatsOverlay open={statsOpen} onClose={() => setStatsOpen(false)} />
      <SettingsOverlay open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

function MenuIconButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-primary-300 dark:border-primary-700 px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors cursor-pointer"
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  )
}
