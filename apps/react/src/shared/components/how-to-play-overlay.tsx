export function HowToPlayContent() {
  return (
    <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-primary-700 marker:font-bold marker:text-secondary-500 dark:text-primary-200">
      <li>
        Pick a mode: <b>Actordle</b> (guess the actor) or <b>Filmdle</b> (guess the movie).
      </li>
      <li>Type any actor or film. Each guess fills a row of attribute tiles.</li>
      <li>
        Tile colors:
        <div className="mt-2 flex flex-wrap gap-2">
          <Swatch className="bg-success-500" label="Correct" />
          <Swatch className="bg-warning-500" label="Close" />
          <Swatch className="bg-danger-500" label="Wrong" />
        </div>
      </li>
      <li>Arrows on number tiles point toward the answer (↑ higher, ↓ lower).</li>
      <li>
        Solve it in <b>5 tries</b>. New puzzles drop daily.
      </li>
    </ol>
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
