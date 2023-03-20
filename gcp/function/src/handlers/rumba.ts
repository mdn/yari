import httpProxy from "http-proxy";
import type express from "express";
import { Source, sourceUri } from "../env.js";

const rumbaProxy = httpProxy.createProxy({
  target: sourceUri(Source.rumba),
  changeOrigin: true,
  autoRewrite: true,
});

export function proxyRumba(req: express.Request, res: express.Response) {
  rumbaProxy.web(req, res);
}
