import { type ReactNode, useEffect, useState } from "react"
import type { GameColumn } from "@/games/_common/columns"
import { buildActordleColumns } from "@/games/actordle/columns"
import { buildFilmdleColumns } from "@/games/filmdle/columns"

export type GuideGame = "actordle" | "filmdle" | "creditdle" | "showdle" | "plotdle"

const SEEN_PREFIX = "filmdle-guide-seen"

function guideSeen(game: GuideGame): boolean {
  try {
    return localStorage.getItem(`${SEEN_PREFIX}:${game}`) !== null
  } catch {
    // Storage blocked: don't nag on every visit.
    return true
  }
}

function markGuideSeen(game: GuideGame): void {
  try {
    localStorage.setItem(`${SEEN_PREFIX}:${game}`, "1")
  } catch {
    // ignore
  }
}

/**
 * Guide state for a game screen: opens by itself the first time someone
 * plays this game on this device, and can be reopened from the header.
 */
export function useGameGuide(game: GuideGame) {
  const [open, setOpen] = useState(() => !guideSeen(game))
  return {
    open,
    show: () => setOpen(true),
    close: () => {
      markGuideSeen(game)
      setOpen(false)
    },
  }
}

const TITLES: Record<GuideGame, string> = {
  actordle: "How to play Actordle",
  filmdle: "How to play Filmdle",
  creditdle: "How to play Creditdle",
  showdle: "How to play Showdle",
  plotdle: "How to play Plotdle",
}

export function GameGuide({
  game,
  open,
  onClose,
}: {
  game: GuideGame
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/60 p-4"
      onClick={onClose}
      onKeyDown={undefined}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-guide-title"
        className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-lg border border-primary-300 bg-primary-50 shadow-xl dark:border-primary-700 dark:bg-primary-900"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={undefined}
      >
        <h2
          id="game-guide-title"
          className="fa5-title px-5 pt-5 pb-2 text-2xl uppercase text-danger-600 dark:text-primary-50"
        >
          {TITLES[game]}
        </h2>
        <div className="scroll-fade min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4 text-sm leading-relaxed text-primary-700 dark:text-primary-200">
          {game === "actordle" && (
            <ClueGuide
              intro="Guess today's mystery actor in 6 tries. Type any actor's name: each guess fills a row of tiles comparing them with the answer."
              columns={buildActordleColumns()}
            />
          )}
          {game === "filmdle" && (
            <ClueGuide
              intro="Guess today's mystery film in 6 tries. Type any film title: each guess fills a row of tiles comparing it with the answer."
              columns={buildFilmdleColumns()}
            />
          )}
          {(game === "creditdle" || game === "showdle") && (
            <CreditGuide media={game === "creditdle" ? "film" : "TV"} />
          )}
          {game === "plotdle" && <PlotGuide />}
          <p>
            There's a new daily puzzle every day, the same for everyone. When you're done, keep
            going with endless bonus rounds.
          </p>
        </div>
        <div className="border-t border-primary-200 px-5 py-3 dark:border-primary-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-md bg-danger-600 px-6 py-2.5 uppercase tracking-wide text-primary-50 transition-colors hover:bg-danger-700 dark:bg-danger-500 dark:hover:bg-danger-600"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h3 className="fa5-title mb-1 text-base uppercase text-primary-900 dark:text-primary-50">
      {children}
    </h3>
  )
}

function ColorKey({ children }: { children: ReactNode }) {
  return <ul className="space-y-1.5">{children}</ul>
}

function ColorRow({ className, children }: { className: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-0.5 inline-block h-4 w-4 shrink-0 rounded ${className}`} aria-hidden />
      <span>{children}</span>
    </li>
  )
}

function ClueGuide<T>({ intro, columns }: { intro: string; columns: GameColumn<T>[] }) {
  return (
    <>
      <p>{intro}</p>
      <div>
        <Heading>Tile colors</Heading>
        <ColorKey>
          <ColorRow className="bg-success-600">
            <b>Green</b>: matches the answer exactly.
          </ColorRow>
          <ColorRow className="bg-warning-600">
            <b>Yellow</b>: close, but not exact.
          </ColorRow>
          <ColorRow className="bg-danger-600">
            <b>Red</b>: not a match.
          </ColorRow>
          <ColorRow className="bg-primary-100 border border-primary-300 dark:bg-primary-800 dark:border-primary-600">
            <b>?</b>: we don't have that detail for your guess.
          </ColorRow>
        </ColorKey>
        <p className="mt-2">
          On number tiles, the arrow points toward the answer: <b>↑</b> means the answer is higher,{" "}
          <b>↓</b> lower.
        </p>
      </div>
      <div>
        <Heading>The columns</Heading>
        <dl className="space-y-1.5">
          {columns.map((c) => (
            <div key={c.id}>
              <dt className="inline font-semibold text-primary-900 dark:text-primary-50">
                {c.label}:{" "}
              </dt>
              <dd className="inline">{c.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}

function CreditGuide({ media }: { media: "film" | "TV" }) {
  const what = media === "film" ? "films they starred in" : "TV shows they had a recurring role in"
  return (
    <>
      <p>Name the mystery actor from {what}. You start with one credit and have 6 guesses.</p>
      <p>
        Each wrong guess reveals another credit, up to 5 in total, so the clues get easier as you
        go.
      </p>
      <div>
        <Heading>Your guesses</Heading>
        <ColorKey>
          <ColorRow className="bg-success-500">
            <b>Green ✓</b>: that's the actor.
          </ColorRow>
          <ColorRow className="bg-danger-500">
            <b>Red ✕</b>: not them. Another credit unlocks.
          </ColorRow>
        </ColorKey>
      </div>
    </>
  )
}

function PlotGuide() {
  return (
    <>
      <p>
        Read a deliberately terrible plot summary and name the movie. You have 3 guesses: type any
        film title.
      </p>
      <div>
        <Heading>Hints</Heading>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b>Year</b> and <b>Genre</b> unlock for free after your first miss.
          </li>
          <li>
            <b>Main character</b> (described just as badly) unlocks free after your second miss.
          </li>
          <li>
            Stuck sooner? Tap a hint early. It still works, but shows as a 💡 in your shared result.
          </li>
        </ul>
      </div>
      <p>
        Every plot has its own link, so you can send one to a friend. The animated-movies toggle
        controls whether cartoons show up in bonus rounds.
      </p>
    </>
  )
}
