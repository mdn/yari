import type express from "express";
import { withProxyResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";
import httpProxy from "http-proxy";

export function createContentProxy(): express.Handler {
  const contentProxy = httpProxy.createProxy({
    prependPath: true,
    changeOrigin: true,
    target: sourceUri(Source.content),
    autoRewrite: true,
  });
  contentProxy.on("proxyRes", withProxyResponseHeaders);
  return (req, res) => {
    contentProxy.web(req, res);
  };
}
