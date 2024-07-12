export const env = {
  DEV: import.meta.env.DEV || import.meta.env.VITE_DEV === "1" || import.meta.env.VITE_DEV === "true",
  API_BASE_URL: String(import.meta.env.VITE_API_BASE_URL ?? "https://ar.dolar.openapps.ar/api/v1"),
}