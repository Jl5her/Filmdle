export function AboutContent() {
  const buildDate = new Date(__APP_BUILD_DATE__).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <>
      <p className="text-sm leading-relaxed text-primary-700 dark:text-primary-200">
        Filmdle is a daily film-trivia guessing game. Two modes, one round each per day: guess the
        actor or guess the movie in five tries.
      </p>

      <p className="mt-3 text-sm leading-relaxed text-primary-700 dark:text-primary-200">
        Film and actor data courtesy of{" "}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-secondary-500 underline-offset-2 hover:text-secondary-500"
        >
          TMDB
        </a>
        .
      </p>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
        <dt className="font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
          Build
        </dt>
        <dd className="font-mono text-primary-900 dark:text-primary-100">{__APP_COMMIT__}</dd>
        <dt className="font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
          Released
        </dt>
        <dd className="text-primary-900 dark:text-primary-100">{buildDate}</dd>
      </dl>
    </>
  )
}
