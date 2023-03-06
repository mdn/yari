import type express from "express";
import { SOURCE_INTERACTIVE_SAMPLES } from "../env.js";
import httpProxy from "http-proxy";

const proxy = httpProxy.createProxy({
  prependPath: true,
  changeOrigin: true,
  target: SOURCE_INTERACTIVE_SAMPLES,
  autoRewrite: true,
});

export async function interactiveSamples(
  req: express.Request,
  res: express.Response
) {
  proxy.web(req, res);
}
