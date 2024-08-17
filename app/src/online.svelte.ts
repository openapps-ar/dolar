import { sleep } from "./sleep";

const API_URL = "https://api.ipify.org?format=json";
const TIMEOUT = 5000;
const INTERVAL = 5000;

let value = $state(true)

const update_now = async (): Promise<boolean> => {
  
  return await new Promise<boolean>(_resolve => {
    let resolved = false;
    const resolve = (v: boolean) => {
      if(resolved) return;
      resolved = true;
      try {
        clearTimeout(timer);
        controller.abort();
      } finally {}
      const prev = value;
      if(prev !== v) {
        console.log(`online status changed to ${v}`);
        value = v;
      }
      _resolve(v)
    }

    const controller = new AbortController();
    const signal = controller.signal;
    
    const timer = setTimeout(() => resolve(false), TIMEOUT);

    fetch(API_URL, { signal, mode: "cors" })
      .then(res => resolve(res.ok))
      .catch(e => resolve(false))
  })
}

const start_interval = () => {
  
  let closed = false;
  
  (async () => {
    while(true) {
      if(closed) return;
      await update_now().catch(e => {
        console.warn("error updating online status", e);
      });
      if(closed) return;
      await sleep(INTERVAL);
    }
  })()

  return () => {
    closed = true;
  }
}

export const online = {
  get $() { return value },
  update_now,
  start_interval,
}
  