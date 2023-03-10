import type * as express from "express";
import httpProxy from "http-proxy";
import * as path from "node:path";
import { Source } from "../env.js";
import { responder } from "../source.js";
import { withResponseHeaders, withProxyResponseHeaders } from "../headers.js";

export function bcdApi(): express.Handler {
  return responder({
    source: Source.bcdApi,
    http(source) {
      const bcdProxy = httpProxy.createProxy({
        prependPath: true,
        changeOrigin: true,
        target: source,
        autoRewrite: true,
      });
      bcdProxy.on("proxyRes", withProxyResponseHeaders);
      return (req, res) => bcdProxy.web(req, res);
    },
    file(source) {
      return (req, res) => {
        const rPath = req.path;
        const filePath = path.join(source, rPath);
        return withResponseHeaders(res).sendFile(filePath);
      };
    },
  });
}
