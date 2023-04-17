import type express from "express";
import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { withContentResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";

const NOT_FOUND_PATH = "en-us/_spas/404.html";

let notFoundBuffer: ArrayBuffer;

export function createContentProxy(): express.Handler {
  const target = sourceUri(Source.content);
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    autoRewrite: true,
    proxyTimeout: 20000,
    xfwd: true,
    selfHandleResponse: true,
    onProxyReq: fixRequestBody,
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        withContentResponseHeaders(proxyRes, req, res);
        if (proxyRes.statusCode === 404) {
          if (!notFoundBuffer) {
            const response = await fetch(`${target}${NOT_FOUND_PATH}`);
            notFoundBuffer = await response.arrayBuffer();
          }
          res.setHeader("Content-Type", "text/html");
          return Buffer.from(notFoundBuffer);
        }

        return responseBuffer;
      }
    ),
  });
}
