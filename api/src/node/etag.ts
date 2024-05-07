import crypto from "node:crypto"

export const make_etag = (v: string | Buffer): string => {
  const hash = crypto.createHash("md5").update(v).digest("hex")
  return `"${hash}"`;
}