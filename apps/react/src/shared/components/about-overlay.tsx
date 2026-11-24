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

      <section className="mt-5 space-y-3 text-sm leading-relaxed text-primary-700 dark:text-primary-200">
        <h3 className="fa5-title text-base uppercase text-primary-900 dark:text-primary-50">
          How answers are picked
        </h3>
        <p>
          You can guess almost any actor or film, but the answers come from hand-picked lists of
          names most movie fans will know. No deep cuts or trick questions.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <b>Actordle</b>: well-known actors with long careers, spanning several generations.
          </li>
          <li>
            <b>Filmdle</b>: famous films people have actually seen: box-office hits, award winners
            and classics from every era.
          </li>
          <li>
            <b>Creditdle</b>: actors who have starred in at least five popular films (each widely
            rated on TMDB). Clues are films where they were top-billed, never a cameo.
          </li>
          <li>
            <b>Showdle</b>: actors with recurring roles in at least five TV shows, at least five
            episodes each. A one-off guest spot doesn't count.
          </li>
          <li>
            <b>Plotdle</b>: well-known movies, with plots badly explained by hand. Bonus rounds skip
            the more obscure ones.
          </li>
        </ul>
        <p>
          Each day's puzzle is the same for everyone, and the dailies work through each list in a
          fixed order, so an answer won't repeat until the whole list has been used.
        </p>
      </section>

      <p className="mt-5 text-sm leading-relaxed text-primary-700 dark:text-primary-200">
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
        <dt className="uppercase tracking-wider text-primary-500 dark:text-primary-300">Build</dt>
        <dd className="font-mono text-primary-900 dark:text-primary-100">{__APP_COMMIT__}</dd>
        <dt className="uppercase tracking-wider text-primary-500 dark:text-primary-300">
          Released
        </dt>
        <dd className="text-primary-900 dark:text-primary-100">{buildDate}</dd>
      </dl>
    </>
  )
}
