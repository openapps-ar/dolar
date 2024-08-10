import type { Api } from "../../../api/src/api"; 
import { assert_never } from "../../../api/src/assert_never";
import { env } from "../env/env";
import { storage_var } from "../storage.svelte.js";

export type NowStored = {
  hash: string,
  data: Api["now.json"],
  obtained_at: Date | string 
};

export type Stored<T> = {
  obtained_at: Date | string
  hash: string
  data: T
}

export type NowItem = Api["now.json"]["items"][number];

export type ApiResult<T> = 
  | { kind: "not-modified" }
  | { kind: "new-data", hash: string, data: T };

export const api_get = async <K extends keyof Api>(key: K, if_none_match: string | null): Promise<ApiResult<Api[K]>> => {
  const controller = new AbortController();
  const res = await fetch(`${env.API_BASE_URL}/${key}`, { signal: controller.signal, mode: "cors" })
  if(!res.ok) throw new Error(`error fetching ${key}: status code not OK: ${res.status} ${res.statusText}`);
  const hash = res.headers.get("x-hash") ?? null;
  if(hash == null) throw new Error(`error fetching ${key}: no hash in headers`);
  if(if_none_match != null && if_none_match === hash) {
    controller.abort();
    return { kind: "not-modified" }
  }
  const data: Api[K] = await res.json();
  return { kind: "new-data", hash, data };
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
      
      fn();
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
    
    const prev_hash = storage.$?.hash ?? null;

    const r = await api_get(key, prev_hash);

    if(r.kind === "not-modified") {
      console.log(`obtained not modified response for ${key}`)
    } else if(r.kind === "new-data") {
      console.log(`obtained new data for ${key}`)

      const { hash, data } = r;
      const stored = { obtained_at: new Date(), hash, data };

      const start_set = Date.now();
      storage.set(stored);

      const elapsed_set = Date.now() - start_set;
      console.log(`refresh set ${key} ${options.storage_key} in ${elapsed_set}ms`)
      
      const elapsed = Date.now() - start;
      console.log(`refreshed ${key} ${options.storage_key} in ${elapsed}ms`);
    } else {
      assert_never(r, "api_get().r.kind")  
    }
  }

  return {
    get $() { return storage.$ },
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

type HistoricStore = ReturnType<typeof stored_api<"all.json">>;

let _HISTORIC: HistoricStore | null = null;

export const HISTORIC = () => {

  if(_HISTORIC == null) {
    _HISTORIC = stored_api("all.json", {
      stale_ms: 1000 * 60 * 60 * 1, // 1 hour
      check_interval_ms: 1000 * 5, // 5 seconds
      storage_key: "data-historic-v2",
      initial: null
    })
  }

  return _HISTORIC;
}