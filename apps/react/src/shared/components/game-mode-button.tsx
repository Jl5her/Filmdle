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
        "w-full px-5 py-4 rounded-lg border-2 text-left transition-all cursor-pointer",
        "bg-primary-100 dark:bg-primary-800 border-primary-200 dark:border-primary-700",
        "hover:bg-primary-200 dark:hover:bg-primary-700 hover:border-secondary-500",
        "flex items-center justify-between gap-3",
      )}
    >
      <div className="flex flex-col">
        <span className="font-black text-lg tracking-wide text-primary-900 dark:text-primary-50">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-primary-600 dark:text-primary-300 mt-0.5">{sublabel}</span>
        )}
      </div>
      {played && (
        <span className="text-[10px] uppercase tracking-wider font-bold text-success-600 bg-success-500/20 px-2 py-1 rounded">
          Played
        </span>
      )}
    </button>
  )
}
