export type Runtime = {
  code_storage_key: string,
  current_code_origin?: "network" | "storage" | "apk" | "dev" | null
  current_app?: any
  current_hash?: string | null
  destroyers: (() => void)[]
  splash_screen_hide_called: boolean
}

// @ts-expect-error
export const run = window._run as Runtime;