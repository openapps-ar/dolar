import { Router } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { make_etag } from "./etag.js";
import zlib from "node:zlib";
import zstand from "@toondepauw/node-zstd";
const encoder = new zstand.Encoder(3);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const build_dir = path.resolve(__dirname, "../../../app/build") 

export const shell = () => {
  const shell = Router();

  for(const name of [ "app-entry.js", "app-entry.json", "app-hash.txt", "app.js" ]) {
    const ext = path.extname(name);
    const buf = fs.readFileSync(`${build_dir}/${name}`);
    const etag = make_etag(buf);
    const algos = {
      br: zlib.brotliCompressSync(buf.toString("utf-8")),
      zstd: encoder.encodeSync(buf),
      gzip: zlib.gzipSync(buf),
    }
    
    shell.route(`/${name}`).get((req, res) => {
      // res.type(ext).send(buf);
      const req_etag = req.headers["if-none-match"];
      if(req_etag != null && req_etag === etag) return res.status(304).end();
      
      const req_encodings = req.header("accept-encoding")
        ?.split(",")
        .map(s => s.trim())
        .filter(Boolean) 
        ?? [];

      const compressed = req_encodings
        .filter(enc => ["zstd", "br", "gzip"].includes(enc))
        .map(enc => ({ enc: enc as "zstd" | "br" | "gzip", data: algos[enc as "zstd" | "br" | "gzip"] }))
        .sort((a, b) => a.data.length - b.data.length)
        [0];
  
      if(compressed != null) {
        res
          .type(ext)
          .vary("accept-encoding")
          .header("etag", etag)
          .header("content-length", compressed.data.byteLength.toString())
          .header("content-encoding", compressed.enc)
          .end(compressed.data);
        return;  
      }

      res.type(ext)
        .vary("accept-encoding")
        .header("etag", etag)
        .header("content-length", buf.byteLength.toString())
        .header("content-encoding", "identity")
        .end(buf);
    })
  }

  return shell;
}