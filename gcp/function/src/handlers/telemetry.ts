import type express from "express";
import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer();

export const proxyTelemetry = (req: express.Request, res: express.Response) => {
  proxy.web(req, res, {
    target: "https://incoming.telemetry.mozilla.org",
    changeOrigin: true,
    autoRewrite: true,
    proxyTimeout: 20000,
    xfwd: true,
  });
};
