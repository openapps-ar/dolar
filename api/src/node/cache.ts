import { type Api } from "../api.js"
import brotli from "brotli";
import zstand from "@toondepauw/node-zstd"
import { make_etag } from "./etag.js"
import zlib from "node:zlib";

const encoder = new zstand.Encoder(3)

export type CacheItem = {
  etag: string
  payload: string
  buf: Buffer
  gzip: Buffer
  br: Buffer
  zstd: Buffer
}

export type Cache = Record<keyof Api, CacheItem>

export const make_cache = (api: Api): Cache => {
  const start = performance.now();
  const cache: Cache = Object.create(null)
  
  for(const [key, data] of Object.entries(api) as [keyof Api, any]) {
    const payload = JSON.stringify(data)
    const buf = Buffer.from(payload, "utf-8")
    const gzip = zlib.gzipSync(payload)
    const br = zlib.brotliCompressSync(payload)
    const zstd = encoder.encodeSync(buf);
    const etag = make_etag(buf);
    cache[key] = { etag, payload, buf, zstd, br, gzip,  }
  }

  const end = performance.now();
  console.log(`created cache in ${end - start}ms`);

  return cache
}