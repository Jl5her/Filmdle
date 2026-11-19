export function AboutContent() {
  const buildDate = new Date(__APP_BUILD_DATE__).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <>
      <p className="text-sm leading-relaxed text-primary-700 dark:text-primary-200">
        Filmdle is a set of five daily film-trivia games: guess actors, films and TV stars from
        clues, credits and some very poorly explained plots.
      </p>

      <p className="mt-3 text-sm leading-relaxed text-primary-700 dark:text-primary-200">
        Film and actor data courtesy of{" "}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-primary-500 underline-offset-2 hover:text-primary-900 dark:hover:text-primary-50"
        >
          TMDB
        </a>
        .
      </p>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
        <dt className="uppercase tracking-wider text-primary-500 dark:text-primary-400">Build</dt>
        <dd className="font-mono text-primary-900 dark:text-primary-100">{__APP_COMMIT__}</dd>
        <dt className="uppercase tracking-wider text-primary-500 dark:text-primary-400">
          Released
        </dt>
        <dd className="text-primary-900 dark:text-primary-100">{buildDate}</dd>
      </dl>
    </>
  )
}
