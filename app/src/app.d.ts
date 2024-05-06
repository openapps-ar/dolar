declare module "$app-code" {
  
  declare const entry: {
    hash: string
    js: string,
    css?: string | null,
  }

  export default entry;
}

declare global {
  interface Window {
    _run: import("./runtime").Runtime
  }
}