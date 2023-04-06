import type express from "express";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";

import { withProxyResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";

const NOT_FOUND_PATH = "en-us/_spas/404.html";

export function createContentProxy(): express.Handler {
  const target = sourceUri(Source.content);
  return createProxyMiddleware({
    changeOrigin: true,
    target,
    autoRewrite: true,
    proxyTimeout: 20000,
    xfwd: true,
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        withProxyResponseHeaders(proxyRes, req, res);
        if (proxyRes.statusCode === 404) {
          const response = await fetch(`${target}${NOT_FOUND_PATH}`);
          res.setHeader("Content-Type", "text/html");
          return Buffer.from(await response.arrayBuffer());
        }

        return responseBuffer;
      }
    ),
  });
}
