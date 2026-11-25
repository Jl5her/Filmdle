import { code39Bars } from "@/shared/lib/code39"

interface Props {
  /** Digits printed as the stub's barcode (e.g. the puzzle number). */
  code: string
  /** Rip the stub along the perforation (the game is over). */
  torn?: boolean
}

/**
 * Print on the ticket's tear-off stub: a scannable Code 39 barcode up the
 * right edge and, once the game ends, a ragged rip along the perforation.
 * Render as a direct child of `.app-viewport`. "ADMIT ONE" on the left
 * edge comes from CSS.
 */
export function TicketDecor({ code, torn = false }: Props) {
  return (
    <>
      <StubBarcode code={code} />
      {torn && <div className="ticket-rip" aria-hidden="true" />}
      {/* Keyboard open: continues the stub's paper below the app, behind
          Safari's floating toolbar, instead of leaving a dark gap. */}
      <div className="kb-overhang" aria-hidden="true" />
    </>
  )
}

function StubBarcode({ code }: { code: string }) {
  const { bars, length } = code39Bars(code)
  return (
    <svg
      className="ticket-stub-barcode"
      viewBox={`0 0 1 ${length}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Barcode ${code}`}
    >
      {bars.map((b) => (
        <rect key={b.at} x={0} y={b.at} width={1} height={b.size} fill="currentColor" />
      ))}
    </svg>
  )
}
