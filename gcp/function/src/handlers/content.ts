import type express from "express";
import * as path from "node:path";
import { slugToFolder } from "@yari-internal/slug-utils";
import { withResponseHeaders } from "../headers.js";
import { responder } from "../source.js";
import { Source } from "../env.js";
import httpProxy from "http-proxy";

export function docs(): express.Handler {
  return responder({
    source: Source.content,
    http(source) {
      const contentProxy = httpProxy.createProxy({
        changeOrigin: true,
        target: source,
        autoRewrite: true,
      });
      return (req, res) => contentProxy.web(req, res);
    },
    file(source) {
      return (req, res) => {
        const rPath = req.path;
        const folderName = slugToFolder(rPath);
        let filePath = path.join(source, folderName);
        if (path.extname(filePath) === "") {
          filePath = path.join(filePath, "index.html");
        }
        return withResponseHeaders(res, { csp: true, xFrame: true }).sendFile(
          filePath
        );
      };
    },
  });
}
