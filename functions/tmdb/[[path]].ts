interface Env {
  TMDB_BEARER: string
}

interface PagesContext<E> {
  request: Request
  env: E
  params: Record<string, string | string[]>
}

/**
 * The only TMDB lookups the games make. Anything else is refused, so the
 * deployment's TMDB key can't be used as a general-purpose proxy.
 */
const ALLOWED: { path: RegExp; params: string[] }[] = [
  { path: /^search\/(movie|person)$/, params: ["query", "include_adult", "page"] },
  { path: /^movie\/\d+$/, params: ["append_to_response"] },
  { path: /^person\/\d+$/, params: [] },
  { path: /^person\/\d+\/(movie|tv)_credits$/, params: [] },
]

export const onRequest = async (context: PagesContext<Env>): Promise<Response> => {
  const { request, env, params } = context

  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonError(405, "Only GET is supported")
  }

  if (!env.TMDB_BEARER) {
    return jsonError(500, "TMDB_BEARER is not configured for this Pages deployment")
  }

  const segments = Array.isArray(params.path) ? params.path : [params.path]
  const path = segments.filter(Boolean).join("/")
  if (!path) {
    return jsonError(400, "Missing TMDB path")
  }

  const rule = ALLOWED.find((r) => r.path.test(path))
  if (!rule) {
    return jsonError(404, "Unknown TMDB path")
  }

  // Forward only the query parameters that lookup uses.
  const url = new URL(request.url)
  const query = [...url.searchParams]
    .filter(([key]) => rule.params.includes(key))
    .map(([key, value]) => `${key}=${encodeURIComponent(value).replaceAll("%2C", ",")}`)
    .join("&")
  const target = `https://api.themoviedb.org/3/${path}${query ? `?${query}` : ""}`

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.TMDB_BEARER}`,
        Accept: "application/json",
      },
    })
  } catch (err) {
    return jsonError(502, `Upstream fetch failed: ${(err as Error).message}`)
  }

  const headers = new Headers()
  const contentType = upstream.headers.get("Content-Type")
  if (contentType) headers.set("Content-Type", contentType)
  // Cache successful lookups only: an error or rate-limit response must not
  // be served from cache for the next day.
  headers.set("Cache-Control", upstream.ok ? "public, max-age=3600, s-maxage=86400" : "no-store")

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  })
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
