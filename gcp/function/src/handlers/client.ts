import type express from "express";
import httpProxy from "http-proxy";
import * as path from "node:path";
import { Source } from "../env.js";
import { responder } from "../source.js";

export function client(): express.Handler {
  return responder({
    source: Source.client,
    http(source) {
      const clientProxy = httpProxy.createProxy({
        changeOrigin: true,
        target: source,
        autoRewrite: true,
      });
      return (req, res) => clientProxy.web(req, res);
    },
    file(source) {
      return (req, res) => {
        const rPath = req.path;
        const filePath = path.join(source, rPath);
        res.sendFile(filePath);
      };
    },
  });
}
