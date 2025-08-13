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

const notFoundBufferCache: Record<string, Promise<ArrayBuffer>> = {};

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

    req.headers["target"] = actualTarget;

    return actualTarget;
  },
  proxyTimeout: PROXY_TIMEOUT,
  xfwd: true,
  selfHandleResponse: true,
  on: {
    proxyReq: fixRequestBody,
    proxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        const { target } = req.headers;

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

          res.setHeader("Content-Type", "text/html");
          const locale = req.url?.match(/[^/]+/)?.[0] ?? "en-us";
          return get404ForLocale(locale);
        }

        return responseBuffer;
      }
    ),
  },
});

async function get404ForLocale(
  locale: string
): Promise<Buffer<ArrayBufferLike> | string> {
  let notFoundBuffer: Promise<ArrayBuffer>;
  if (notFoundBufferCache[locale]) {
    notFoundBuffer = notFoundBufferCache[locale];
  } else {
    const response = await fetch(`${target}${locale}/404/index.html`);
    notFoundBuffer = response.arrayBuffer();
    if (!WILDCARD_ENABLED) {
      if (response.ok) {
        notFoundBufferCache[locale] = notFoundBuffer;
      } else {
        return locale === "en-us" ? "not found" : get404ForLocale("en-us");
      }
    }
  }

  return Buffer.from(await notFoundBuffer);
}
