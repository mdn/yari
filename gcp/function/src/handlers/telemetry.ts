import httpProxy from "http-proxy";
import type express from "express";

const telemetryProxy = httpProxy.createProxy({
  target: "https://incoming.telemetry.mozilla.org",
  changeOrigin: true,
  autoRewrite: true,
});

export function telemetry(req: express.Request, res: express.Response) {
  telemetryProxy.web(req, res);
}
