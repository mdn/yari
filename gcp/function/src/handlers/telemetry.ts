import { createProxyMiddleware } from "http-proxy-middleware";

export const proxyTelemetry = createProxyMiddleware({
  target: "https://httpbin.org",
  logLevel: "debug",
  secure: false,
  changeOrigin: true,
  autoRewrite: true,
  pathRewrite: function (path, req) {
    return `/anything`;
  },
  proxyTimeout: 20000,
  xfwd: true,
  headers: {
    Connection: "keep-alive",
  },
});
