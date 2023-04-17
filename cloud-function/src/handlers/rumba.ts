import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

import { Source, sourceUri } from "../env.js";

export const proxyRumba = createProxyMiddleware({
  target: sourceUri(Source.rumba),
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: 20000,
  xfwd: true,
  onProxyReq: fixRequestBody,
});
