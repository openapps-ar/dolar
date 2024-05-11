export const env = {
  DEV: (window.location.port === "3000" || window.location.hostname.endsWith("ngrok-free.app"))
}