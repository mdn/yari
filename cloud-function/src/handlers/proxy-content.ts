/* eslint-disable n/no-unsupported-features/node-builtins */
import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { withContentResponseHeaders } from "../headers.js";
import { determineInfix, Source, sourceUri } from "../env.js";
import { INDEX_SUFFIX, PROXY_TIMEOUT } from "../constants.js";
import { isLiveSampleURL } from "../utils.js";

const NOT_FOUND_PATH = `en-us/404${INDEX_SUFFIX}`;

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
        const infix = determineInfix(req.headers.host);

        withContentResponseHeaders(proxyRes, req, res);

        if (proxyRes.statusCode === 404 && !isLiveSampleURL(req.url ?? "")) {
          const url = `${target}${infix}/${req.url?.slice(1).toLowerCase()}`;
          const tryHtml = await fetch(url);
          console.log(
            `[proxyContent] ok = ${JSON.stringify(tryHtml.ok)}, url = ${JSON.stringify(url)}, `
          );
          if (tryHtml.ok) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            return Buffer.from(await tryHtml.arrayBuffer());
          } else if (!notFoundBuffer) {
            const url = `${target}${infix}/${NOT_FOUND_PATH}`;
            const response = await fetch(url);
            console.log(
              `[proxyContent] ok = ${JSON.stringify(response.ok)}, url = ${JSON.stringify(url)}, `
            );
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
