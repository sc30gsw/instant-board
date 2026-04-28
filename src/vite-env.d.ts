interface ViteTypeOptions {
  // この行を追加することで ImportMetaEnv の型を厳密にし、不明なキーを許可しないように
  // できます。
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_INSTANT_APP_ID: string;
  readonly VITE_INSTANT_APP_ADMIN_TOKEN: string;
  readonly VITE_INSTANT_GOOGLE_CLIENT_NAME?: string;
}

declare module "*?url" {
  const src: string;
  export default src;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
