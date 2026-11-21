import { Component, type ErrorInfo, type ReactNode } from "react"
import { useLocation } from "react-router-dom"

interface State {
  error: Error | null
}

class Boundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Filmdle crashed", error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    // A new deploy can remove the code chunk an open tab still points at.
    const stale =
      /dynamically imported module|Loading chunk|Importing a module script failed/i.test(
        this.state.error.message,
      )
    return (
      <div className="app-viewport flex flex-col" role="alert">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-[var(--ticket-pad-x)] pb-[var(--ticket-safe-bottom)] text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-danger-600 dark:text-danger-500">
            ★ Intermission ★
          </p>
          <h1 className="fa5-title text-3xl uppercase text-primary-900 dark:text-primary-50">
            Projector trouble
          </h1>
          <p className="max-w-xs text-sm text-primary-600 dark:text-primary-300">
            {stale
              ? "Filmdle was updated while this page was open. Reload to get the new version."
              : "Something went wrong showing this screen. Your games and stats are safe."}
          </p>
        </div>
        <div className="ticket-stub flex h-[var(--tear-height)] shrink-0 items-center justify-center gap-3 px-4">
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="cursor-pointer rounded-md border-2 border-danger-600 px-4 py-3 uppercase tracking-wide text-danger-600 transition-colors hover:bg-danger-600/10 dark:border-danger-500 dark:text-primary-50"
          >
            Back to menu
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-md bg-danger-600 px-4 py-3 uppercase tracking-wide text-primary-50 transition-colors hover:bg-danger-700 dark:bg-danger-500"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}

/** Shows a recoverable error screen instead of a blank page; resets when the route changes. */
export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <Boundary key={pathname}>{children}</Boundary>
}
