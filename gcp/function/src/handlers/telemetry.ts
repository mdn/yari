import { createProxyMiddleware } from "http-proxy-middleware";

export const proxyTelemetry = createProxyMiddleware({
  target: "https://incoming.telemetry.mozilla.org",
  logLevel: "debug",
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: 20000,
  xfwd: true,
  headers: {
    Connection: "keep-alive",
  },
});
