import { createProxyMiddleware } from "http-proxy-middleware";

export const proxyTelemetry = createProxyMiddleware({
  target: "https://incoming.telemetry.mozilla.org",
  autoRewrite: true,
  xfwd: true,
});
