import type * as express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import { Source, sourceUri } from "../env.js";
import { withProxyResponseHeaders } from "../headers.js";

export function proxyBcdApi(): express.Handler {
  return createProxyMiddleware({
    prependPath: true,
    changeOrigin: true,
    target: sourceUri(Source.bcdApi),
    autoRewrite: true,
    onProxyRes: withProxyResponseHeaders,
  });
}
