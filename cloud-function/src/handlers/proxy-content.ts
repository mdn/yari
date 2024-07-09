/* eslint-disable n/no-unsupported-features/node-builtins */
import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { withContentResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";
import { PROXY_TIMEOUT } from "../constants.js";
import { isLiveSampleURL } from "../utils.js";

const NOT_FOUND_JSON = "en-us/_spas/404.json";
const NOT_FOUND_HTML = "en-us/_spas/404.html";

const bufferCache = new Map<string, ArrayBuffer>();

const target = sourceUri(Source.content);

export const proxyContent = createProxyMiddleware({
  target,
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: PROXY_TIMEOUT,
  xfwd: true,
  selfHandleResponse: true,
  on: {
    proxyReq: fixRequestBody,
    proxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        withContentResponseHeaders(proxyRes, req, res);
        if (proxyRes.statusCode === 404 && !isLiveSampleURL(req.url ?? "")) {
          const tryHtml = await fetch(
            `${target}${req.url?.slice(1)}/index.html`
          );
          if (tryHtml.ok) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            return Buffer.from(await tryHtml.arrayBuffer());
          }

          let buffer: Buffer;
          if (req.url?.endsWith("/index.json")) {
            buffer = await fetchAsBufferWithCache(`${target}${NOT_FOUND_JSON}`);
            res.setHeader("Content-Type", "text/json");
          } else {
            buffer = await fetchAsBufferWithCache(`${target}${NOT_FOUND_HTML}`);
            res.setHeader("Content-Type", "text/html");
          }

          return buffer;
        }

        return responseBuffer;
      }
    ),
  },
});

async function fetchAsBufferWithCache(url: string) {
  let buffer = bufferCache.get(url);

  if (!buffer) {
    const response = await fetch(url);
    buffer = await response.arrayBuffer();
    bufferCache.set(url, buffer);
  }

  return Buffer.from(buffer);
}
