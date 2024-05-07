import { type Api } from "../api.js"
import { make_etag } from "./etag.js"

export type CacheItem = {
  etag: string
  payload: string
  payload_buf: Buffer,
}

export type Cache = Record<keyof Api, CacheItem>

export const make_cache = (api: Api): Cache => {
  const start = performance.now();
  const cache: Cache = Object.create(null)
  
  for(const [key, data] of Object.entries(api) as [keyof Api, any]) {
    const payload = JSON.stringify(data)
    const payload_buf = Buffer.from(payload, "utf-8")
    const etag = make_etag(payload_buf);
    cache[key] = { etag, payload, payload_buf }
  }

  const end = performance.now();
  console.log(`created cache in ${end - start}ms`);

  return cache
}