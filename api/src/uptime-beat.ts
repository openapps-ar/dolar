const url = process.env.UPTIME_BEAT_URL ?? null;

if(url != null) {
  console.log(`sending beat to specified url`);
  const res = await fetch(url);
  console.log(`beat sent - status: ${res.status} ${res.statusText}`)
} else {
  console.log("no beat url specified, ignoring")
}