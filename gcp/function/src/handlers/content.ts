import type express from "express";
import { withProxyResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";
import httpProxy from "http-proxy";
import { resolveIndexHTML } from "../utils.js";

export function createContentProxy(): express.Handler {
  const contentProxy = httpProxy.createProxy({
    prependPath: true,
    changeOrigin: true,
    target: sourceUri(Source.content),
    autoRewrite: true,
  });
  contentProxy.on("proxyRes", withProxyResponseHeaders);
  return (req, res) => {
    if (!req.url.startsWith("/static/")) {
      req.url = resolveIndexHTML(req.url);
    }
    contentProxy.web(req, res);
  };
}
