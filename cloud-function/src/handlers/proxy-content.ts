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

const NOT_FOUND_PATH = "en-us/404/index.html";

let notFoundBuffer: ArrayBuffer;

const target = sourceUri(Source.review);

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
          const url = `${target}${req.url?.slice(1)}`;
          const tryHtml = await fetch(url);
          console.log(url);
          if (tryHtml.ok) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            return Buffer.from(await tryHtml.arrayBuffer());
          } else if (!notFoundBuffer) {
            const response = await fetch(`${target}${NOT_FOUND_PATH}`);
            notFoundBuffer = await response.arrayBuffer();
          }
          res.setHeader("Content-Type", "text/html");
          return Buffer.from(notFoundBuffer);
        }

        return responseBuffer;
      }
    ),
  },
});
