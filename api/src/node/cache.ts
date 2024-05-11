import { type Api } from "../api.js"
import { make_hash } from "./hash.js"
import { LRUCache } from "lru-cache";
import { Compressed, compress } from "./compress.js";

const compress_cache = new LRUCache<string, Compressed>({
  // aprox files in Api is 3500
  max: 5_000,
})


export type CacheItem = {
  hash: string
  etag: string
  payload: string
  buf: Buffer
  compressed: Compressed
}

export type Cache = Record<keyof Api, CacheItem>

export const make_cache = (api: Api): Cache => {
  
  // let size = {
  //   br: 0,
  //   gzip: 0,
  //   zstd: 0
  // }

  const start = performance.now();
  const cache: Cache = Object.create(null)
  
  for(const [key, data] of Object.entries(api) as [keyof Api, any]) {
    const payload = JSON.stringify(data)
    const buf = Buffer.from(payload, "utf-8")
    const { hash, etag } = make_hash(buf);
    
    let compressed: Compressed | null = compress_cache.get(etag) ?? null;
    if(compressed == null) compressed = compress(buf);
    
    // size.br += compressed.br.byteLength
    // size.gzip += compressed.gzip.byteLength
    // size.zstd += compressed.zstd.byteLength

    compress_cache.set(etag, compressed)
    
    cache[key] = { hash, etag, payload, buf, compressed  }
  }

  const end = performance.now();
  console.log(`created cache in ${(end - start).toFixed(2)}ms`);
  // console.log("cache size", size);

  return cache
}