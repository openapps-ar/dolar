import http from "http";
import https from "https";

export const http_agent = new http.Agent({ keepAlive: false, maxSockets: Infinity });
export const https_agent = new https.Agent({ keepAlive: false, maxSockets: Infinity });

export const agent = (url: URL) => {
  return url.protocol === "https:" ? https_agent : http_agent;
}