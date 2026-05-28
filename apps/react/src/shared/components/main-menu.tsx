import clsx from "clsx"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatLongDate, todayKey } from "@/shared/lib/date"
import { hasPlayedToday } from "@/shared/lib/stats"
import { AboutContent } from "./about-overlay"
import { FilmIcon } from "./film-icon"
import { GameModeButton } from "./game-mode-button"
import { HowToPlayContent } from "./how-to-play-overlay"
import { InlinePanel } from "./inline-panel"
import { SettingsContent } from "./settings-overlay"

type Panel = "settings" | "about" | "how-to-play" | null

const showDebug = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEBUG === "true"

export function MainMenu() {
  const navigate = useNavigate()
  const [panel, setPanel] = useState<Panel>(null)
  const close = () => setPanel(null)

  const today = useMemo(() => todayKey(), [])
  const actordleDone = hasPlayedToday("actordle", today)
  const filmdleDone = hasPlayedToday("filmdle", today)

  return (
    <>
      <div className="flex w-full flex-1 flex-col items-center px-4 pt-10 pb-[var(--tear-height)]">
        <div className="text-center">
          <FilmIcon
            className="mx-auto mb-3 h-14 w-14 text-primary-800 dark:text-primary-100"
            title="Filmdle"
          />
          <h1 className="fa5-title text-5xl text-danger-600 dark:text-primary-50">FILMDLE</h1>
          <p className="mt-2 text-sm text-primary-700 sm:text-base dark:text-primary-200">
            Can you guess the actor or film in 5 tries?
          </p>
        </div>

        <div className="relative mt-6 w-full flex-1 overflow-hidden">
          <div
            className={clsx(
              "crossfade-panel flex h-full flex-col items-center justify-end pb-16",
              panel === null ? "crossfade-active" : "crossfade-inactive",
            )}
          >
            <div className="flex w-full max-w-xs flex-col gap-3">
              <GameModeButton
                label="Actordle"
                played={actordleDone}
                onClick={() => navigate("/actordle")}
              />
              <GameModeButton
                label="Filmdle"
                played={filmdleDone}
                onClick={() => navigate("/filmdle")}
              />
            </div>
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

      {/* Tear-away footer: icons + date are vertically centered inside
          the bottom stub of the ticket. */}
      <div className="absolute inset-x-0 bottom-0 h-[var(--tear-height)] flex flex-col items-center justify-center gap-2 px-4">
        <div className="flex items-center justify-center gap-3">
          <CircleIcon
            label="How to play"
            onClick={() => setPanel("how-to-play")}
            svg={<QuestionSvg />}
          />
          <CircleIcon label="About" onClick={() => setPanel("about")} svg={<InfoSvg />} />
          <CircleIcon label="Settings" onClick={() => setPanel("settings")} svg={<GearSvg />} />
          {showDebug && (
            <CircleIcon
              label="Debug: answer calendar"
              onClick={() => navigate("/debug/calendar")}
              svg={<CalendarSvg />}
            />
          )}
        </div>
        <p className="text-xs text-primary-700 dark:text-primary-300">
          {formatLongDate()}
        </p>
      </div>
    </>
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
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full",
        "border border-danger-600/40 bg-primary-50 dark:border-primary-300/30 dark:bg-primary-800/60",
        "text-danger-700 dark:text-primary-100",
        "transition-colors hover:bg-danger-600/10 dark:hover:bg-primary-700",
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="7.75" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CalendarSvg() {
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
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.243 0 1.171 1.025 1.171 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.452.999-1.452 1.827V14.5" />
      <circle cx="12" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}
