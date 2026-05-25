import clsx from "clsx"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatLongDate } from "@/shared/lib/date"
import { AboutContent } from "./about-overlay"
import { FilmIcon } from "./film-icon"
import { GameModeButton } from "./game-mode-button"
import { HowToPlayContent } from "./how-to-play-overlay"
import { InlinePanel } from "./inline-panel"
import { SettingsContent } from "./settings-overlay"

type Panel = "settings" | "about" | "how-to-play" | null

export function MainMenu() {
  const navigate = useNavigate()
  const [panel, setPanel] = useState<Panel>(null)
  const close = () => setPanel(null)

  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 pt-10 pb-6">
      <div className="text-center">
        <FilmIcon
          className="mx-auto mb-3 h-14 w-14 text-primary-800 dark:text-primary-100"
          title="Filmdle"
        />
        <h1 className="fa5-title text-5xl text-primary-900 dark:text-primary-50">FILMDLE</h1>
        <p className="mt-2 text-sm font-bold text-primary-700 sm:text-base dark:text-primary-200">
          Can you guess the actor or film in 5 tries?
        </p>
      </div>

      <div className="relative mt-6 w-full flex-1 overflow-hidden">
        <div
          className={clsx(
            "crossfade-panel flex h-full flex-col",
            panel === null ? "crossfade-active" : "crossfade-inactive",
          )}
        >
          <div className="flex flex-1 flex-col items-center justify-end pb-4">
            <div className="flex w-full max-w-xs flex-col gap-3">
              <GameModeButton label="Actordle" onClick={() => navigate("/actordle")} />
              <GameModeButton label="Filmdle" onClick={() => navigate("/filmdle")} />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <CircleIcon
                label="How to play"
                onClick={() => setPanel("how-to-play")}
                svg={<QuestionSvg />}
              />
              <CircleIcon label="About" onClick={() => setPanel("about")} svg={<InfoSvg />} />
              <CircleIcon label="Settings" onClick={() => setPanel("settings")} svg={<GearSvg />} />
            </div>
          </div>
          <p className="pb-2 text-center text-sm font-semibold text-primary-700 dark:text-primary-300">
            {formatLongDate()}
          </p>
        </div>

        <InlinePanel open={panel === "how-to-play"} title="How to Play" onClose={close}>
          <HowToPlayContent />
        </InlinePanel>
        <InlinePanel open={panel === "about"} title="About" onClose={close}>
          <AboutContent />
        </InlinePanel>
        <InlinePanel open={panel === "settings"} title="Settings" onClose={close}>
          <SettingsContent />
        </InlinePanel>
      </div>
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
        "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full",
        "bg-primary-200/80 dark:bg-primary-800/70",
        "text-primary-700 dark:text-primary-200",
        "transition-colors hover:bg-primary-300 dark:hover:bg-primary-700",
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
      className="h-5 w-5"
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
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line
        x1="12"
        y1="11"
        x2="12"
        y2="17"
        stroke="var(--color-primary-50)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.5" r="1.2" fill="var(--color-primary-50)" />
    </svg>
  )
}

function QuestionSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
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
