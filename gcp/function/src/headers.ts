import type { IncomingMessage, ServerResponse } from "node:http";
import type express from "express";

import { CSP_VALUE } from "./internal/constants/index.js";

export function withContentResponseHeaders(
  _proxyRes: IncomingMessage,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
): ServerResponse<IncomingMessage> {
  if (res.headersSent) {
    return res;
  }

  const isLiveSampleURI = req.url?.includes("/_sample_.") ?? false;

  setContentResponseHeaders((name, value) => res.setHeader(name, value), {
    csp:
      !isLiveSampleURI &&
      parseContentType(_proxyRes.headers["content-type"]).startsWith(
        "text/html"
      ),
    xFrame: !isLiveSampleURI,
  });

  if (req.url?.endsWith("/sitemap.xml.gz")) {
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Content-Encoding", "gzip");
  }

  return res;
}

function parseContentType(value: unknown): string {
  const firstValue = Array.isArray(value) ? value[0] ?? "" : value;

  return typeof firstValue === "string" ? firstValue : "";
}

export function withResponseHeaders(
  res: express.Response,
  options?: { csp?: boolean; xFrame?: boolean }
): express.Response {
  setContentResponseHeaders(
    (name, value) => res.set(name, value),
    options ?? {}
  );
  return res;
}

export function setContentResponseHeaders(
  setHeader: (name: string, value: string) => void,
  { csp = true, xFrame = true }: { csp?: boolean; xFrame?: boolean }
): void {
  [
    ["X-XSS-Protection", "1; mode=block"],
    ["X-Content-Type-Options", "nosniff"],
    ["Strict-Transport-Security", "max-age=63072000"],
    ...(csp ? [["Content-Security-Policy", CSP_VALUE]] : []),
    ...(xFrame ? [["X-Frame-Options", "DENY"]] : []),
  ].forEach(([k, v]) => k && v && setHeader(k, v));
}

export function country(res: express.Request): string {
  return res.header("X-Appengine-Country") || "";
}
