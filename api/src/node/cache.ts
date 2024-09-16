import { type Api } from "../api.js"
import { make_hash } from "./hash.js"
import { Compressed, compress } from "./compress.js";

let compress_index = new Map<string, Compressed>();

export type CacheItem = {
  hash: string
  etag: string
  text: string
  buf: Buffer
  compressed: Compressed
}

export type Cache = Record<keyof Api, CacheItem>

export const make_cache = (api: Api): Cache => {
  
  let new_compress_index = new Map<string, Compressed>();

  const start = performance.now();
  const cache: Cache = Object.create(null)
  
  for(const [key, data] of Object.entries(api) as [keyof Api, any][]) {
    const text = JSON.stringify(data)
    const buf = Buffer.from(text, "utf-8")
    const { hash, etag } = make_hash(buf);
    
    let compressed: Compressed | null = compress_index.get(hash) ?? null;
    if(compressed == null) compressed = compress(buf);
    new_compress_index.set(hash, compressed)
    
    cache[key] = { hash, etag, text, buf, compressed  }
  }

  const end = performance.now();
  compress_index = new_compress_index;
  console.log(`created cache in ${(end - start).toFixed(2)}ms`);
  // console.log("cache size", size);

  return cache
}