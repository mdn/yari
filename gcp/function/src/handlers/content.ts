import type express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import { withProxyResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";

export function createContentProxy(): express.Handler {
  return createProxyMiddleware({
    prependPath: true,
    changeOrigin: true,
    target: sourceUri(Source.content),
    autoRewrite: true,
    onProxyRes: withProxyResponseHeaders,
  });
}
