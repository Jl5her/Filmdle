import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const tmdbBearer = env.TMDB_BEARER ?? ""

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/tmdb": {
          target: "https://api.themoviedb.org",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/tmdb/, "/3"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (tmdbBearer) {
                proxyReq.setHeader("Authorization", `Bearer ${tmdbBearer}`)
              }
              proxyReq.setHeader("Accept", "application/json")
            })
          },
        },
      },
    },
  }
})
