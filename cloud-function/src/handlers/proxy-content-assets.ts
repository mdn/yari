/* eslint-disable n/no-unsupported-features/node-builtins */
import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { withContentResponseHeaders } from "../headers.js";
import { determineInfix, Source, sourceUri } from "../env.js";
import { PROXY_TIMEOUT } from "../constants.js";
import { ACTIVE_LOCALES } from "../internal/constants/index.js";

const target = sourceUri(Source.review);

export const proxyContentAssets = createProxyMiddleware({
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

        const [, locale] = req.url?.split("/") || [];
        if (
          proxyRes.statusCode === 404 &&
          locale &&
          locale != "en-US" &&
          ACTIVE_LOCALES.has(locale.toLowerCase())
        ) {
          const url = `${target}${infix}/${req.url?.slice(1).replace(locale, "en-us")}`;
          const enUsAsset = await fetch(url);
          console.log(
            `[proxyContentAssets] ok = ${JSON.stringify(enUsAsset.ok)}, url = ${JSON.stringify(url)}, `
          );
          if (enUsAsset?.ok) {
            res.statusCode = enUsAsset.status;
            enUsAsset.headers.forEach((value, key) =>
              res.setHeader(key, value)
            );
            return Buffer.from(await enUsAsset.arrayBuffer());
          }
        }

        return responseBuffer;
      }
    ),
  },
});
