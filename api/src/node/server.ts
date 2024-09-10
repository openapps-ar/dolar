import express, { Router } from "express";
import { get_cache } from "./data.js";
import { CacheItem } from "./cache.js";
import { shell } from "./app.js";
import cors from "cors";
import { send } from "./compress.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const api = () => {

  const api = Router();

  api.use((req, res, next) => {
    const { method } = req;
    if (method !== "GET" && method !== "HEAD") return next();

    const cache = get_cache() as Record<string, CacheItem | undefined>;
    const entry = cache[req.path.slice(1)];

    if (entry == null) return next();

    send(req, res, {
      type: ".json",
      hash: entry.hash,
      etag: entry.etag,
      plain: entry.buf,
      compressed: entry.compressed
    })
  })

  return api;
}


const app = express();

app.use(cors({
  exposedHeaders: "*",
}));

app.use("/api/v1", api());
app.use("/shell/v1", shell());

app.use(express.static(path.resolve(__dirname, "../../../static"), {
  etag: true,
}));

// TODO: get from env
app.listen(4000, () => {
  console.log("listening on http://localhost:4000");
  // pm2
  process.send && process.send("ready");
});