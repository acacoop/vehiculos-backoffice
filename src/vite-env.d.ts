/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_BASE_URL: string;
  readonly VITE_ENTRA_CLIENT_ID: string;
  readonly VITE_ENTRA_TENANT_ID: string;
  readonly VITE_ENTRA_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
