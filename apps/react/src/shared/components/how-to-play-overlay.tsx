import { useState } from "react"
import { GameGuide, type GuideGame } from "./game-guide"

const MODES: { name: string; games: { id: GuideGame; label: string }[]; body: string }[] = [
  {
    name: "Actordle & Filmdle",
    games: [
      { id: "actordle", label: "Actordle" },
      { id: "filmdle", label: "Filmdle" },
    ],
    body: "Guess any actor or film. Each guess fills a row of clue tiles. Solve it in 6 tries.",
  },
  {
    name: "Creditdle & Showdle",
    games: [
      { id: "creditdle", label: "Creditdle" },
      { id: "showdle", label: "Showdle" },
    ],
    body: "Name the actor from their film or TV credits. Each miss reveals another credit. 6 tries.",
  },
  {
    name: "Plotdle",
    games: [{ id: "plotdle", label: "Plotdle" }],
    body: "Name the movie from a terribly explained plot in 3 tries. Tap a hint (main character, year, genre) if you're stuck, and send any plot to a friend.",
  },
]

export function HowToPlayContent() {
  const [guide, setGuide] = useState<GuideGame | null>(null)
  return (
    <div className="space-y-5 text-sm leading-relaxed text-primary-700 dark:text-primary-200">
      <ul className="space-y-3">
        {MODES.map((m) => (
          <li key={m.name}>
            <h3 className="fa5-title text-base uppercase text-primary-900 dark:text-primary-50">
              {m.name}
            </h3>
            <p>{m.body}</p>
            <p className="mt-1 flex flex-wrap gap-2">
              {m.games.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGuide(g.id)}
                  className="cursor-pointer rounded-md border border-danger-600/40 px-2.5 py-1 text-xs uppercase tracking-wider text-danger-600 transition-colors hover:bg-danger-600/10 dark:border-primary-300/30 dark:text-primary-100 dark:hover:bg-primary-700"
                >
                  {g.label} guide
                </button>
              ))}
            </p>
          </li>
        ))}
      </ul>
      <div>
        <h3 className="fa5-title text-base uppercase text-primary-900 dark:text-primary-50">
          Tile colors
        </h3>
        <div className="mt-2 flex flex-wrap gap-3">
          <Swatch className="bg-success-600" label="Correct" />
          <Swatch className="bg-warning-600" label="Close" />
          <Swatch className="bg-danger-600 tile-miss" label="Wrong" />
        </div>
        <p className="mt-2">Arrows on number tiles point toward the answer (↑ higher, ↓ lower).</p>
      </div>
      <p>Every game has a new daily puzzle. Keep playing after with endless rounds.</p>
      <p>
        In a game, tap <b>?</b> in the header or any column heading to see that game's guide again.
      </p>
      {guide && <GameGuide game={guide} open onClose={() => setGuide(null)} />}
    </div>
  )
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`inline-block h-4 w-4 rounded ${className}`} aria-hidden="true" />
      {label}
    </span>
  )
}
