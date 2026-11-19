/** Suspense fallback: the empty ticket plus a quiet "now loading" marquee. */
export function LoadingTicket() {
  return (
    <div className="app-viewport items-center justify-center" aria-busy="true">
      <p className="fa5-title animate-pulse text-lg uppercase tracking-[0.3em] text-primary-500 dark:text-primary-300">
        Now loading
      </p>
    </div>
  )
}
