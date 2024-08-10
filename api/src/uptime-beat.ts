import { env } from "./env.js";

export const uptime_beat = async () => {
  if(env.UPTIME_BEAT_URL != null) {
    console.log(`sending beat to specified url`);
    try {
      const res = await fetch(env.UPTIME_BEAT_URL);
      console.log(`beat sent - status: ${res.status} ${res.statusText}`)
    } catch(e) {
      console.warn(`error sending beat: ${String(e)}`);
    }
  } else {
    console.log("no beat url specified, ignoring")
  }
}