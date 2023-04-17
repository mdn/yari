import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

import { Source, sourceUri } from "../env.js";

export const proxyApi = createProxyMiddleware({
  target: sourceUri(Source.api),
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: 20000,
  xfwd: true,
  onProxyReq: fixRequestBody,
});
