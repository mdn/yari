import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { DEBUG_TELEMETRY } from "../env.js";

export const proxyTelemetry = createProxyMiddleware({
  target: DEBUG_TELEMETRY
    ? "http://localhost:8888/"
    : "https://incoming.telemetry.mozilla.org",
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: 20000,
  xfwd: true,
  onProxyReq: fixRequestBody,
});
