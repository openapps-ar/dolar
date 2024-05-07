import express, { Router } from "express";
import { get_api, get_cache } from "./data.js";
import { CacheItem } from "./cache.js";

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

    res.type(".json");
    res.header("etag", entry.etag);
    res.end(entry.payload_buf);
   })

   return api;
}


const app = express();
app.use("/api", api());

// TODO: get from env
app.listen(4000, () => {
  console.log("listening on http://localhost:4000");
});