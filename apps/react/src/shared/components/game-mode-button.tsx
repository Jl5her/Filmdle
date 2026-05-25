import clsx from "clsx"

interface Props {
  label: string
  sublabel?: string
  played?: boolean
  onClick: () => void
}

export function GameModeButton({ label, sublabel, played, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full px-6 py-4 rounded-full border-2 transition-all cursor-pointer",
        "bg-secondary-500 border-secondary-500 text-primary-900",
        "hover:brightness-95 hover:-translate-y-px",
        "shadow-sm hover:shadow-md",
        "flex items-center justify-center gap-3",
      )}
    >
      <span className="fa5-title text-2xl uppercase tracking-wide">{label}</span>
      {sublabel && (
        <span className="hidden sm:inline text-xs font-semibold opacity-80">{sublabel}</span>
      )}
      {played && (
        <span className="text-[10px] uppercase tracking-wider font-bold bg-primary-900/20 px-2 py-0.5 rounded-full">
          Played
        </span>
      )}
    </button>
  )
}
