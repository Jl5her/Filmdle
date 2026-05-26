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
        "w-full px-6 py-3 rounded-md transition-colors cursor-pointer",
        "bg-danger-600 text-primary-50 hover:bg-danger-700",
        "dark:bg-danger-500 dark:hover:bg-danger-600",
        "active:translate-y-px",
        "flex items-center justify-center gap-2",
      )}
    >
      <span className="font-extrabold text-base tracking-wide">{label}</span>
      {sublabel && (
        <span className="hidden sm:inline text-xs font-semibold opacity-80">{sublabel}</span>
      )}
      {played && (
        <span className="text-[10px] uppercase tracking-wider font-bold bg-primary-50/20 px-2 py-0.5 rounded-full">
          Completed
        </span>
      )}
    </button>
  )
}
