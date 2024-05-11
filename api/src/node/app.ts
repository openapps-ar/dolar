import { Router } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { make_hash } from "./hash.js";
import { compress, send } from "./compress.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const build_dir = path.resolve(__dirname, "../../../app/build") 

export const shell = () => {
  const shell = Router();

  for(const name of [ "app-entry.js", "app-entry.json", "app-hash.txt", "app.js" ]) {
    const ext = path.extname(name);
    const buf = fs.readFileSync(`${build_dir}/${name}`);
    const { hash, etag } = make_hash(buf);
    const compressed = compress(buf);
    
    shell.route(`/${name}`).get((req, res) => {
      send(req, res, {
        type: ext,
        hash,
        etag,
        plain: buf,
        compressed
      })
    })
  }

  return shell;
}