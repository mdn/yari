import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { withContentResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";
import { PROXY_TIMEOUT } from "../constants.js";

const NOT_FOUND_PATH = "en-us/_spas/404.html";

let notFoundBuffer: ArrayBuffer;

const target = sourceUri(Source.content);

export const proxyContent = createProxyMiddleware({
  target,
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: PROXY_TIMEOUT,
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
