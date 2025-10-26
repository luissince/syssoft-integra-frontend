/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BACK_END: string;
  readonly VITE_APP_APIS_PERU: string;
  readonly VITE_APP_ENV: "development" | "production";
  readonly VITE_APP_NAME: "Nombre de la aplicación";
  // 🔹 aquí puedes agregar todas las variables que uses en tu proyecto:
  // readonly VITE_API_KEY: string;
  // readonly VITE_APP_TITLE: string;
}

declare const __APP_VERSION__: string;

declare const __APP_TITLE__: string;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
