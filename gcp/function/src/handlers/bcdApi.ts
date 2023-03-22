import type * as express from "express";
import httpProxy from "http-proxy";
import { Source, sourceUri } from "../env.js";
import { withProxyResponseHeaders } from "../headers.js";

export function proxyBcdApi(): express.Handler {
  const bcdProxy = httpProxy.createProxy({
    prependPath: true,
    changeOrigin: true,
    target: sourceUri(Source.bcdApi),
    autoRewrite: true,
  });
  bcdProxy.on("proxyRes", withProxyResponseHeaders);

  return (req, res) => bcdProxy.web(req, res);
}
