import { createProxyMiddleware } from "http-proxy-middleware";

export const proxyTelemetry = createProxyMiddleware({
  target: "https://httpbin.org/post",
  logLevel: "debug",
  secure: false,
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: 20000,
  xfwd: true,
  headers: {
    Connection: "keep-alive",
  },
});
