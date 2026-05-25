import clsx from "clsx"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatLongDate } from "@/shared/lib/date"
import { AboutOverlay } from "./about-overlay"
import { FilmIcon } from "./film-icon"
import { GameModeButton } from "./game-mode-button"
import { HowToPlayOverlay } from "./how-to-play-overlay"
import { SettingsOverlay } from "./settings-overlay"

type OverlayKey = "settings" | "about" | "how-to-play" | null

export function MainMenu() {
  const navigate = useNavigate()
  const [overlay, setOverlay] = useState<OverlayKey>(null)
  const close = () => setOverlay(null)

  return (
    <div className="flex flex-col items-center flex-1 w-full px-4 pt-10 pb-6">
      <div className="text-center">
        <FilmIcon
          className="mx-auto mb-3 w-14 h-14 text-primary-800 dark:text-primary-100"
          title="Filmdle"
        />
        <h1 className="fa5-title text-5xl text-primary-900 dark:text-primary-50">FILMDLE</h1>
        <p className="text-sm sm:text-base font-bold text-primary-700 dark:text-primary-200 mt-2">
          Can you guess the actor or film in 5 tries?
        </p>
      </div>

      <div className="flex-1" />

      <div className="w-full max-w-xs flex flex-col gap-3">
        <GameModeButton label="Actordle" onClick={() => navigate("/actordle")} />
        <GameModeButton label="Filmdle" onClick={() => navigate("/filmdle")} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <CircleIcon label="How to play" onClick={() => setOverlay("how-to-play")} svg={<QuestionSvg />} />
        <CircleIcon label="About" onClick={() => setOverlay("about")} svg={<InfoSvg />} />
        <CircleIcon label="Settings" onClick={() => setOverlay("settings")} svg={<GearSvg />} />
      </div>

      <p className="text-sm text-primary-700 dark:text-primary-300 text-center mt-5 font-semibold">
        {formatLongDate()}
      </p>

      <SettingsOverlay open={overlay === "settings"} onClose={close} />
      <AboutOverlay open={overlay === "about"} onClose={close} />
      <HowToPlayOverlay open={overlay === "how-to-play"} onClose={close} />
    </div>
  )
}

function CircleIcon({
  label,
  onClick,
  svg,
}: {
  label: string
  onClick: () => void
  svg: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx(
        "w-11 h-11 rounded-full flex items-center justify-center cursor-pointer",
        "bg-primary-200/80 dark:bg-primary-800/70",
        "text-primary-700 dark:text-primary-200",
        "hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors",
      )}
    >
      {svg}
    </button>
  )
}

function GearSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.07a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.86-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1.13-1.55 1.7 1.7 0 0 0-1.86.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.86 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.86l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.86.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.86-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.86V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-1.55 1z" />
    </svg>
  )
}

function InfoSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="17" stroke="var(--color-primary-50)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.2" fill="var(--color-primary-50)" />
    </svg>
  )
}

function QuestionSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.2 9a3 3 0 0 1 5.6 1c0 2-2.8 2.5-2.8 4" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
