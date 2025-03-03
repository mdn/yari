/* eslint-disable n/no-unsupported-features/node-builtins */
import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { withContentResponseHeaders } from "../headers.js";
import { Source, sourceUri, WILDCARD_ENABLED } from "../env.js";
import { PROXY_TIMEOUT } from "../constants.js";
import { isLiveSampleURL } from "../utils.js";

const NOT_FOUND_PATH = "en-us/404/index.html";

let notFoundBuffer: ArrayBuffer;

const target = sourceUri(Source.content);

export const proxyContent = createProxyMiddleware({
  changeOrigin: true,
  autoRewrite: true,
  router: (req) => {
    let actualTarget = target;

    if (WILDCARD_ENABLED) {
      const { host } = req.headers;

      if (typeof host === "string") {
        const subdomain = host.split(".")[0];
        actualTarget = `${target}${subdomain}/`;
      }
    }

    (req as any).target = actualTarget;

    return actualTarget;
  },
  proxyTimeout: PROXY_TIMEOUT,
  xfwd: true,
  selfHandleResponse: true,
  on: {
    proxyReq: fixRequestBody,
    proxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        const { target } = req as any;

        withContentResponseHeaders(proxyRes, req, res);
        if (proxyRes.statusCode === 404 && !isLiveSampleURL(req.url ?? "")) {
          const tryHtml = await fetch(
            `${target}${req.url?.slice(1)}/index.html`
          );
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
