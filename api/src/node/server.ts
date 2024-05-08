import express, { Router } from "express";
import { get_cache } from "./data.js";
import { CacheItem } from "./cache.js";
import { shell } from "./app.js";
import cors from "cors";
import compression from "compression";

const api = () => {
  
  const api = Router();
  
  api.use((req, res, next) => {
    const { method } = req;
    if(method !== "GET" && method !== "HEAD") return next();
   
    const cache = get_cache() as Record<string, CacheItem | undefined>;
    const entry = cache[req.path.slice(1)];

    if(entry == null) return next();
    const req_etag = req.headers["if-none-match"];
    
    if(req_etag != null && req_etag == entry.etag) return res.status(304).end();

    const req_encodings = req.header("accept-encoding")
                            ?.split(",")
                            .map(s => s.trim())
                            .filter(Boolean) 
                            ?? [];
    const compressed = req_encodings
      .filter(enc => ["zstd", "br", "gzip"].includes(enc))
      .map(enc => ({ enc: enc as "zstd" | "br" | "gzip", data: entry[enc as "zstd" | "br" | "gzip"] }))
      .sort((a, b) => a.data.length - b.data.length)
      [0];

    if(compressed != null) {
      res
        .type(".json")
        .vary("accept-encoding")
        .header("etag", entry.etag)
        .header("content-length", compressed.data.byteLength.toString())
        .header("content-encoding", compressed.enc)
        .end(compressed.data);
      return;  
    }

    res
      .type(".json")
      .vary("accept-encoding")
      .header("etag", entry.etag)
      .header("content-length", entry.buf.byteLength.toString())
      .header("content-encoding", "identity")
      .end(entry.buf);
   })

   return api;
}


const app = express();

app.use(cors());

app.get("/request", (req, res) => {
  res.json({
    method: req.method,
    url: req.url,
    headers: req.headers,
  })
})

app.use("/api/v1", api());
app.use("/shell/v1", shell());

// TODO: get from env
app.listen(4000, () => {
  console.log("listening on http://localhost:4000");
});