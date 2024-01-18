/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RENDERER_VITE_SCREENSCRAPER_DEVID: string
  readonly RENDERER_VITE_SCREENSCRAPER_DEVPASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
