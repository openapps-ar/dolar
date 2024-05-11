import type { Request, Response } from "express";
import zlib from "node:zlib";
// import zstand from "@toondepauw/node-zstd"
// const encoder = new zstand.Encoder(19)

const K = { 
  br: 1,
  gzip: 1,
  // zstd does not produce better compression ratio for this use case and has lower client adoption
  // zstd: 1
}

export const compression_algos = Object.keys(K) as CompressionAlgo[]

export type CompressionAlgo = keyof typeof K;

export type Compressed = Record<CompressionAlgo, Buffer>;

export const compress = (buf: Buffer): Compressed => {
  return {
    br: zlib.brotliCompressSync(buf.toString()),
    gzip: zlib.gzipSync(buf),
    // zstd: encoder.encodeSync(buf)
  }
}

export const accept_encoding = <Algo extends string>(algos: Algo[], req: Request): Algo[] => {
  return req
    .header("accept-encoding")
    ?.split(",")
    .map(s => s.trim() as Algo)
    .filter(enc => algos.includes(enc as any))
    ?? []
}


export type SelectEntry<Algo> = {
  encoding: Algo,
  data: Buffer
}

export const select = <Algo extends string>(req: Request, compressed: Record<Algo, Buffer>): SelectEntry<Algo> | null => {
  const encodings = accept_encoding(Object.keys(compressed) as Algo[], req);
  const selected = encodings
    .map(enc => ({ encoding: enc, data: compressed[enc] }))
    .sort((a, b) => a.data.byteLength - b.data.byteLength)
  [0] ?? null;

  return selected;
}

export const send = <Algo extends string>(
  req: Request,
  res: Response,
  {
    type,
    hash,
    etag,
    plain,
    compressed
  }: {
    type: string
    hash: string
    etag: string
    plain: Buffer
    compressed: Record<Algo, Buffer>
}) => {

  const req_etag = req.header("if-none-match");
  if(req_etag == null && req_etag === etag) {
    res.status(304).end();
    return;
  }

  const selected = select(req, compressed);
  if (selected != null) {
    res
      .type(type)
      .vary("accept-encoding")
      .header("etag", etag)
      .header("x-hash", hash)
      .header("content-length", selected.data.byteLength.toString())
      .header("content-encoding", selected.encoding)
      .end(selected.data);
  } else {
    res
      .type(type)
      .vary("accept-encoding")
      .header("etag", etag)
      .header("x-hash", hash)
      .header("content-length", plain.byteLength.toString())
      .header("content-encoding", "identity")
      .end(plain);
  }
}