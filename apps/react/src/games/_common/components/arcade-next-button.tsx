import { Icon } from "@/shared/components/icon"

/** Skips to another arcade puzzle without finishing this one. */
export function ArcadeNextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] uppercase tracking-widest text-danger-600 transition-colors hover:bg-danger-600/10 dark:text-danger-400 dark:hover:bg-danger-500/20"
    >
      {label}
      <Icon name="chevron-right" />
    </button>
  )
}
