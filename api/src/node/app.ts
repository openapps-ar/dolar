import { Router } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { make_etag } from "./etag.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const build_dir = path.resolve(__dirname, "../../../app/build") 

export const shell = () => {
  const shell = Router();

  for(const name of [ "app-entry.js", "app-entry.json", "app-hash.txt", "app.js" ]) {
    const ext = path.extname(name);
    const buf = fs.readFileSync(`${build_dir}/${name}`);
    const etag = make_etag(buf);
    
    shell.route(`/${name}`).get((req, res) => {
      // res.type(ext).send(buf);
      const req_etag = req.headers["if-none-match"];
      if(req_etag != null && req_etag === etag) return res.status(304).end();
      
      res.type(ext)
        .header("etag", etag)
        .send(buf);
    })
  }

  return shell;
}