/// <reference types="vite/client" />

declare const __APP_COMMIT__: string
declare const __APP_BUILD_DATE__: string

interface ImportMetaEnv {
  readonly VITE_SHOW_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
