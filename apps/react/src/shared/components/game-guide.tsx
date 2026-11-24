import { type ReactNode, useState } from "react"
import type { GameColumn } from "@/games/_common/columns"
import { buildActordleColumns } from "@/games/actordle/columns"
import { buildFilmdleColumns } from "@/games/filmdle/columns"
import { useTheme } from "@/shared/lib/theme-context"
import { InlinePanel, StubButton } from "./inline-panel"

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
    toggle: () =>
      setOpen((v) => {
        if (v) markGuideSeen(game)
        return !v
      }),
  }
}

const TITLES: Record<GuideGame, string> = {
  actordle: "How to play",
  filmdle: "How to play",
  creditdle: "How to play",
  showdle: "How to play",
  plotdle: "How to play",
}

export function guideTitle(game: GuideGame): string {
  return TITLES[game]
}

/** The guide's instructions, shown inside a ticket panel (see GameGuidePanel). */
export function GameGuideContent({ game }: { game: GuideGame }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-primary-700 dark:text-primary-200">
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
        There's a new daily puzzle every day, the same for everyone. When you're done, keep going
        with endless bonus rounds.
      </p>
    </div>
  )
}

/**
 * The guide as a ticket screen: it replaces the game (which keeps its state
 * underneath), the instructions scroll in the main area and "Got it" sits
 * in the stub.
 */
export function GameGuidePanel({
  game,
  open,
  onClose,
}: {
  game: GuideGame
  open: boolean
  onClose: () => void
}) {
  return (
    <InlinePanel
      open={open}
      title={TITLES[game]}
      onClose={onClose}
      className="px-[var(--ticket-pad-x)] pt-3"
      footer={<StubButton onClick={onClose}>Got it</StubButton>}
    >
      {open && <GameGuideContent game={game} />}
    </InlinePanel>
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

function RuleRow({
  className,
  label,
  children,
}: {
  className: string
  label: string
  children: ReactNode
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-sm ${className}`}
        aria-hidden
      />
      <span>
        <b>{label}:</b> {children}
      </span>
    </li>
  )
}

/** Color names as the player sees them (color-blind mode swaps the palette). */
function useColorNames() {
  const { colorblind } = useTheme()
  return colorblind
    ? { hit: "Blue", near: "Orange", miss: "Gray" }
    : { hit: "Green", near: "Yellow", miss: "Red" }
}

function ClueGuide<T>({ intro, columns }: { intro: string; columns: GameColumn<T>[] }) {
  const names = useColorNames()
  const recolor = (text = "") =>
    text
      .replace(/\bGreen\b/g, names.hit)
      .replace(/\bgreen\b/g, names.hit.toLowerCase())
      .replace(/\byellow\b/g, names.near.toLowerCase())
      .replace(/\bYellow\b/g, names.near)
  return (
    <>
      <p>{intro}</p>
      <div>
        <Heading>Tile colors</Heading>
        <ColorKey>
          <ColorRow className="bg-success-600">
            <b>{names.hit}</b>: matches the answer exactly.
          </ColorRow>
          <ColorRow className="bg-warning-600">
            <b>{names.near}</b>: close. Each column below says how close counts.
          </ColorRow>
          <ColorRow className="bg-danger-600 tile-miss">
            <b>{names.miss}</b>: not a match.
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
        <ul className="space-y-2.5">
          {columns.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-primary-200 px-3 py-2 dark:border-primary-700"
            >
              <p>
                <b className="text-primary-900 dark:text-primary-50">{c.label}</b>
                {c.guide ? ` · ${c.guide.about}` : ` · ${recolor(c.description)}`}
              </p>
              {c.guide && (
                <ul className="mt-1.5 space-y-1 text-[13px]">
                  <RuleRow className="bg-success-600" label={names.hit}>
                    {c.guide.green}
                  </RuleRow>
                  {c.guide.yellow && (
                    <RuleRow className="bg-warning-600" label={names.near}>
                      {c.guide.yellow}
                    </RuleRow>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2">Tap any column heading during a game to open this guide again.</p>
      </div>
    </>
  )
}

function CreditGuide({ media }: { media: "film" | "TV" }) {
  const names = useColorNames()
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
            <b>{names.hit} ✓</b>: that's the actor.
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
