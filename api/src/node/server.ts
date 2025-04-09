import express, { Router } from "express";
import { get_cache } from "./data.js";
import { CacheItem } from "./cache.js";
import { shell } from "./app.js";
import cors from "cors";
import { send } from "./compress.js";
import path from "path";
import http from "http";

const __dirname = new URL(".", import.meta.url).pathname;

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

const server = http.createServer(app);

// TODO: get from env
server.listen(4000, () => {
  console.log("listening on http://localhost:4000");
  // pm2
  process.send && process.send("ready");
  // r2
  console.warn("#r2.READY");
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing server");
  
  console.log("closing idle connections");
  server.closeIdleConnections();

  server.close(async () => {
    console.log("server closed, stopping process");
    process.exit(0);
  });

  setTimeout(() => {
    console.log("close timeout reached, stopping process");
    process.exit(0);
  }, 10_000);
})