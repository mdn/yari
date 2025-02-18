import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { Source, sourceUri } from "../env.js";
import { PROXY_TIMEOUT } from "../constants.js";

const target = sourceUri(Source.sharedAssets);

export const proxySharedAssets = createProxyMiddleware({
  target,
  pathRewrite: {
    "^/shared-assets/": "/",
  },
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: PROXY_TIMEOUT,
  xfwd: true,
  selfHandleResponse: true,
  on: {
    proxyReq: fixRequestBody,
    proxyRes: responseInterceptor(
      async (responseBuffer, _proxyRes, _req, res) => {
        if (!res.headersSent) {
          let cacheControl = "no-store, must-revalidate";
          if (200 <= res.statusCode && res.statusCode < 300) {
            cacheControl = `public, max-age=${60 * 60 * 24 * 365}`;
          }
          res.setHeader("Cache-Control", cacheControl);
        }
        return responseBuffer;
      }
    ),
  },
});
