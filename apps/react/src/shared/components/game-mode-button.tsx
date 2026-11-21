import clsx from "clsx"

interface Props {
  label: string
  sublabel: string
  /** Font Awesome icon name without the `fa-` prefix, e.g. "film". */
  icon: string
  played?: boolean
  isNew?: boolean
  className?: string
  onClick: () => void
}

/**
 * Menu entry styled as a tear-off admission stub: a red stub with the
 * game's icon, a dashed perforation, then the name + one-line pitch.
 */
export function GameModeButton({
  label,
  sublabel,
  icon,
  played,
  isNew,
  className,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group flex w-full cursor-pointer items-stretch overflow-hidden rounded-md text-left",
        "border-2 border-primary-200 bg-primary-100/60 transition-[border-color,transform,background-color] duration-150",
        "hover:-translate-y-px hover:border-danger-500/70 hover:bg-primary-100 active:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600",
        "dark:border-primary-700 dark:bg-primary-800/50 dark:hover:border-danger-500/70 dark:hover:bg-primary-800",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "flex w-14 shrink-0 items-center justify-center text-lg text-primary-50 sm:w-16 sm:text-xl",
          played ? "bg-success-600" : "bg-danger-600 dark:bg-danger-500",
        )}
      >
        <i className={clsx("fa-solid", played ? "fa-check" : `fa-${icon}`)} />
      </span>
      <span
        aria-hidden="true"
        className="w-0 border-l-2 border-dashed border-primary-200 dark:border-primary-700"
      />
      <span className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5">
        <span className="flex items-center gap-2">
          <span className="fa5-title text-lg uppercase leading-tight text-primary-900 dark:text-primary-50">
            {label}
          </span>
          {isNew && !played && (
            <span className="rounded-full bg-danger-600 px-1.5 py-px text-[11px] font-semibold uppercase tracking-wider text-primary-50 dark:bg-danger-500">
              New
            </span>
          )}
        </span>
        <span className="truncate text-xs text-primary-600 dark:text-primary-300">
          {played ? "Done for today. Tap to see your result" : sublabel}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="flex items-center pr-3 text-sm text-primary-500 transition-transform group-hover:translate-x-0.5 group-hover:text-danger-600 dark:text-primary-300 dark:group-hover:text-primary-100"
      >
        <i className="fa-solid fa-chevron-right" />
      </span>
    </button>
  )
}
