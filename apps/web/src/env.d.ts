interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_LIVEKIT_URL?: string
  readonly VITE_LIVEKIT_KEY?: string
  // add more VITE_ vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}