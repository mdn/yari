import type express from "express";
import httpProxy from "http-proxy";
import * as path from "node:path";
import { Source } from "../env.js";
import { responder } from "../source.js";
import { resolveIndexHTML } from "../utils.js";
import { withResponseHeaders, withProxyResponseHeaders } from "../headers.js";

export function client(): express.Handler {
  return responder({
    source: Source.client,
    http(source) {
      const clientProxy = httpProxy.createProxy({
        prependPath: true,
        changeOrigin: true,
        target: source,
        autoRewrite: true,
      });
      clientProxy.on("proxyRes", withProxyResponseHeaders);
      return (req, res) => {
        if (!req.url.startsWith("/static/")) {
          req.url = resolveIndexHTML(req.url);
        }
        clientProxy.web(req, res);
      };
    },
    file(source) {
      return (req, res) => {
        const resolvedPath = resolveIndexHTML(req.path);
        const filePath = path.join(source, resolvedPath);
        return withResponseHeaders(res, {
          csp: resolvedPath.endsWith(".html"),
          xFrame: true,
        }).sendFile(filePath);
      };
    },
  });
}
