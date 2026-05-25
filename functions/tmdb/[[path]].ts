interface Env {
  TMDB_BEARER: string
}

interface PagesContext<E> {
  request: Request
  env: E
  params: Record<string, string | string[]>
}

export const onRequest = async (context: PagesContext<Env>): Promise<Response> => {
  const { request, env, params } = context

  if (!env.TMDB_BEARER) {
    return jsonError(500, "TMDB_BEARER is not configured for this Pages deployment")
  }

  const segments = Array.isArray(params.path) ? params.path : [params.path]
  const path = segments.filter(Boolean).join("/")
  if (!path) {
    return jsonError(400, "Missing TMDB path")
  }

  const url = new URL(request.url)
  const target = `https://api.themoviedb.org/3/${path}${url.search}`

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
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400")

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
