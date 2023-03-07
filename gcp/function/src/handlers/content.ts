import type express from "express";
import * as path from "node:path";
import { withResponseHeaders } from "../headers.js";
import { responder } from "../source.js";
import { Source } from "../env.js";
import httpProxy from "http-proxy";
import { resolveIndexHTML } from "../utils.js";

export function docs(): express.Handler {
  return responder({
    source: Source.content,
    http(source) {
      const contentProxy = httpProxy.createProxy({
        prependPath: true,
        ignorePath: true,
        changeOrigin: true,
        target: source,
        autoRewrite: true,
      });
      contentProxy.on("proxyReq", (proxyReq, req) => {
        const resolvedPath = resolveIndexHTML(req.url || "");
        proxyReq.path = path.join(proxyReq.path, resolvedPath);
      });
      return (req, res) => {
        contentProxy.web(req, res);
      };
    },
    file(source) {
      return (req, res) => {
        const resolvedPath = resolveIndexHTML(req.path);
        const filePath = path.join(source, resolvedPath);
        return withResponseHeaders(res, { csp: true, xFrame: true }).sendFile(
          filePath
        );
      };
    },
  });
}
