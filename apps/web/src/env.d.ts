interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY_TEST: string
  readonly VITE_GCP_API_KEY: string
  readonly VITE_GCP_AUTH_DOMAIN: string
  readonly VITE_GCP_PROJECT_ID: string
  readonly VITE_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}