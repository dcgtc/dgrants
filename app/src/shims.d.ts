// Shim for Vue composition API
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default component;
}

// Shims for environment variables
interface ImportMeta {
  env: {
    VITE_BLOCKNATIVE_API_KEY: string;
    VITE_INFURA_ID: string;
    VITE_FLEEK_STORAGE_API_KEY: string;
  };
}
