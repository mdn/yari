import { createProxyMiddleware } from "http-proxy-middleware";

import { Source, sourceUri } from "../env.js";

export const proxyRumba = createProxyMiddleware({
  target: sourceUri(Source.rumba),
  changeOrigin: true,
  autoRewrite: true,
  xfwd: true,
});
