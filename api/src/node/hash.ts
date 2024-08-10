import crypto from "node:crypto"

export const VERSION = "1"

export const make_hash = (v: string | Buffer) => {
  const hash = crypto.createHash("md5").update(v).digest("hex")
  const etag = `"${VERSION}-${hash}"`;
  return { hash, etag }
}