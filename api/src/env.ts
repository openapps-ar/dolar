import "dotenv/config";

export const env = {
  UPTIME_BEAT_URL: process.env.UPTIME_BEAT_URL ?? null,
}

if(env.UPTIME_BEAT_URL == null) {
  console.warn("UPTIME_BEAT_URL not set, uptime beat disabled");
} else {
  console.log("UPTIME_BEAT_URL set to", env.UPTIME_BEAT_URL);
}