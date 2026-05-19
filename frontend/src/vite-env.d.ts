/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Render (or other) Flask API origin — required for production builds */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
