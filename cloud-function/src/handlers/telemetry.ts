import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

export const proxyTelemetry = createProxyMiddleware({
  target: "https://incoming.telemetry.mozilla.org",
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: 20000,
  xfwd: true,
  onProxyReq: fixRequestBody,
});
