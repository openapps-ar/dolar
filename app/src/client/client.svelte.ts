import type { Api } from "../../../api/src/api"; 
import { storage_var } from "../storage.svelte.js";

const BASE_URL = "https://ar.dolar.openapps.ar/api/v1";
const DATA_URL = `1d.json`;
// const DATA_URL = `data.json`;

const CHECK_INTERVAL_MS = 1_000;

const FRESH_MS = 5 * 60 * 1000; // 5 min

export type Stored = {
  data: Api["data.json"],
  obtained_at: Date | string 
};

export const DATA = storage_var<Stored | null>("data-v2", {
  initial: null,
  parse: JSON.parse,
  stringify: JSON.stringify,
  auto_initialize: false,
})

let interval: NodeJS.Timeout | null = null;

export const is_interval_started = () => interval != null;

export const start_interval = () => {
  if(interval == null) {
    const fn = async () => {
      try {
        await refresh_if_stale()
      } finally {
        if(interval != null) interval = setTimeout(fn, CHECK_INTERVAL_MS)
      }
    }

    interval = setTimeout(fn, CHECK_INTERVAL_MS);
  }
}

export const stop_interval = () => {
  if(interval != null) {
    clearInterval(interval);
    interval = null;
  }
}

export const refresh_if_stale = async () => {
  
  const stored = DATA.$;

  if(stored == null) {
    
    await refresh();
    return true;

  } else {

    const obtained_at = new Date(stored.obtained_at);

    if(Date.now() - obtained_at.getTime() > FRESH_MS) {
      await refresh();
      return true;
    }
  }

  return false;
}

export const refresh = async () => {
  
  console.log("refreshing");

  const res = await fetch(`${BASE_URL}/${DATA_URL}`, {
    mode: "cors",
    cache: "reload",
  })

  if(!res.ok) throw new Error(`error fetching ${DATA_URL}: status code not OK: ${res.status} ${res.statusText}`);


  const data = await res.json();

  const stored: Stored = { obtained_at: new Date(), data };

  DATA.set(stored);

  console.log("refreshed")
}