import express, { Router } from "express";
import { get_api } from "./data.js";

const api = () => {
  const api = Router();
  
  api.use((req, res, next) => {
    const { method } = req;
    if(method !== "GET" && method !== "HEAD") return next();
    const { api } = get_api();
    // @ts-ignore
    const body = api[req.path.slice(1)];
    if(body == null) return next();
    res.json(body);
   })

   return api;
}


const app = express();
app.use("/api", api());

// TODO: get from env
app.listen(4000, () => {
  console.log("listening on http://localhost:4000");
});