import type express from "express";
import * as path from "node:path";
import { withResponseHeaders, withProxyResponseHeaders } from "../headers.js";
import { responder } from "../source.js";
import { Source } from "../env.js";
import httpProxy from "http-proxy";
import { resolveIndexHTML } from "../utils.js";

export function createContentProxy(): express.Handler {
  return responder({
    source: Source.content,
    http(source) {
      const contentProxy = httpProxy.createProxy({
        prependPath: true,
        changeOrigin: true,
        target: source,
        autoRewrite: true,
      });
      contentProxy.on("proxyRes", withProxyResponseHeaders);
      return (req, res) => {
        if (!req.url.startsWith("/static/")) {
          req.url = resolveIndexHTML(req.url);
        }
        contentProxy.web(req, res);
      };
    },
    file(source) {
      return (req, res) => {
        let resolvedPath = req.path;
        if (!resolvedPath.startsWith("/static/")) {
          resolvedPath = resolveIndexHTML(resolvedPath);
        }
        const filePath = path.join(source, resolvedPath);
        return withResponseHeaders(res, {
          csp: resolvedPath.endsWith(".html"),
          xFrame: true,
        }).sendFile(filePath);
      };
    },
  });
}
