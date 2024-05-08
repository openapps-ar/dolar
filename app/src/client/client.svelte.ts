import type { Api } from "../../../api/src/api"; 
import { storage_var } from "../storage.svelte.js";

const BASE_URL = "https://ar.dolar.openapps.ar/api/v1";

export type NowStored = {
  data: Api["now.json"],
  obtained_at: Date | string 
};

export type Stored<T> = {
  data: T,
  obtained_at: Date | string
}

export const api_get = async <K extends keyof Api>(key: K): Promise<Api[K]> => {
  const res = await fetch(`${BASE_URL}/${key}`, { mode: "cors" })
  if(!res.ok) throw new Error(`error fetching ${key}: status code not OK: ${res.status} ${res.statusText}`);
  const data: Api[K] = await res.json();
  return data;
}

export type StoredApiOptions<T> = {
  stale_ms: number,
  check_interval_ms: number,
  storage_key: string,
  initial: T | null
}

export const stored_api = <K extends keyof Api>(key: K, options: StoredApiOptions<Stored<Api[K]>>) => {
  type Data = Api[K]
  const storage = storage_var<Stored<Data> | null>(options.storage_key, {
    initial: options.initial,
    parse: JSON.parse,
    stringify: JSON.stringify,
    auto_initialize: false
  });

  let timer: NodeJS.Timeout | null = null;

  const is_interval_started = () => timer != null;
  
  const start_interval = () => {
    if(timer == null) {
      const fn = async () => {
        try {
          await refresh_if_stale()
        } finally {
          if(timer != null) timer = setTimeout(fn, options.check_interval_ms)
        }
      }
  
      timer = setTimeout(fn, options.check_interval_ms);
    }
  }
  
  const stop_interval = () => {
    if(timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  }
  
  const refresh_if_stale = async () => {
    
    const v = storage.$;
  
    if(v == null) {
      
      await refresh();
      return true;
  
    } else {
  
      const obtained_at = new Date(v.obtained_at);
  
      if(Date.now() - obtained_at.getTime() > options.stale_ms) {
        await refresh();
        return true;
      }
    }
  
    return false;
  }
  
  const refresh = async () => {
    const start = Date.now();
    console.log(`refreshing ${key} ${options.storage_key}`);
    
    const data = await api_get(key);
    const stored: Stored<Data> = { obtained_at: new Date(), data };
    storage.set(stored);
    
    const elapsed = Date.now() - start;
    console.log(`refreshed ${key} ${options.storage_key} in ${elapsed}ms`);
  }

  return {
    get $() {
      return storage.$;  
    },
    set: storage.set,
    remove: storage.remove,

    is_interval_started,
    start_interval,
    stop_interval,
    refresh_if_stale,
    refresh
  }
}

export const NOW = stored_api("now.json", {
  stale_ms: 1000 * 60 * 1, // 1 minute
  check_interval_ms: 1000 * 5,
  storage_key: "data-now-v1",
  initial: null
})

type HistoricStore = ReturnType<typeof stored_api<"10y.json">>;

let _HISTORIC: HistoricStore | null = null;

export const HISTORIC = () => {

  if(_HISTORIC == null) {
    _HISTORIC = stored_api("10y.json", {
      stale_ms: 1000 * 60 * 60 * 1, // 1 hour
      check_interval_ms: 1000 * 5, // 5 seconds
      storage_key: "data-historic-v1",
      initial: null
    })
  }

  return _HISTORIC;
}