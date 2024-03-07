import {
  legacyCreateProxyMiddleware,
  fixRequestBody,
} from "http-proxy-middleware";

import { PROXY_TIMEOUT } from "../constants.js";

export const proxyTelemetry = legacyCreateProxyMiddleware({
  target: "https://incoming.telemetry.mozilla.org",
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: PROXY_TIMEOUT,
  xfwd: true,
  on: {
    proxyReq: fixRequestBody,
  },
});
