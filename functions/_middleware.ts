interface PagesContext {
  request: Request
  next: () => Promise<Response>
}

/**
 * Link previews per game. The app is a single page, so every route serves the
 * same index.html, and link-preview bots don't run JavaScript. For a game's
 * pages this rewrites the preview tags (title, description, image) so a shared
 * Actordle link shows an Actordle card instead of the generic Filmdle one.
 */
const GAMES: Record<string, { title: string; description: string }> = {
  actordle: {
    title: "Actordle — Guess the Actor",
    description: "Guess the mystery actor in 6 tries. A daily game from Filmdle.",
  },
  filmdle: {
    title: "Filmdle — Guess the Movie",
    description: "Guess the mystery movie in 6 tries. A daily game from Filmdle.",
  },
  creditdle: {
    title: "Creditdle — Name the Actor from Their Films",
    description: "Name the actor from the films they starred in. A daily game from Filmdle.",
  },
  showdle: {
    title: "Showdle — Name the Actor from Their TV Shows",
    description: "Name the actor from the TV shows they were in. A daily game from Filmdle.",
  },
  plotdle: {
    title: "Plotdle — Name the Movie from a Terrible Plot",
    description:
      "Name the movie from a terribly explained plot in 3 tries. A daily game from Filmdle.",
  },
}

function setContent(value: string): HTMLRewriterElementContentHandlers {
  return {
    element(el) {
      el.setAttribute("content", value)
    },
  }
}

function swapImage(game: string): HTMLRewriterElementContentHandlers {
  return {
    element(el) {
      const current = el.getAttribute("content")
      if (current) el.setAttribute("content", current.replace("/og-image.png", `/og-${game}.png`))
    },
  }
}

export const onRequest = async ({ request, next }: PagesContext): Promise<Response> => {
  const response = await next()
  const game = new URL(request.url).pathname.split("/")[1] ?? ""
  const meta = GAMES[game]
  const isHtml = response.headers.get("content-type")?.includes("text/html")
  if (!meta || !isHtml) return response

  return new HTMLRewriter()
    .on("title", {
      element(el) {
        el.setInnerContent(meta.title)
      },
    })
    .on('meta[name="description"]', setContent(meta.description))
    .on('meta[property="og:title"]', setContent(meta.title))
    .on('meta[property="og:description"]', setContent(meta.description))
    .on('meta[property="og:image:alt"]', setContent(`${meta.title}: an admission ticket`))
    .on('meta[property="og:image"]', swapImage(game))
    .on('meta[name="twitter:image"]', swapImage(game))
    .transform(response)
}
