import type express from "express";
import { Source, sourceUri } from "./env.js";

export interface Transform {
  source: Source;
  http: (source: string) => express.Handler;
  file: (source: string) => express.Handler;
}

export function responder(transform: Transform): express.Handler {
  const source = sourceUri(transform.source);
  if (source.startsWith("http://") || source.startsWith("https://")) {
    return transform.http(source);
  }
  return transform.file(source);
}
