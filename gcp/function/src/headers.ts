import type { IncomingMessage, ServerResponse } from "node:http";
import type express from "express";

import { CSP_VALUE } from "@yari-internal/constants";

import { RUNTIME_ENV } from "./env.js";

export function withProxyResponseHeaders(
  _proxyRes: IncomingMessage,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
): ServerResponse<IncomingMessage> {
  const isLiveSampleURI = req.url?.includes("/_sample_.") ?? false;

  setResponseHeaders((name, value) => res.setHeader(name, value), {
    csp:
      !isLiveSampleURI &&
      parseContentType(_proxyRes.headers["content-type"]).startsWith(
        "text/html"
      ),
    xFrame: !isLiveSampleURI,
  });

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
  setResponseHeaders((name, value) => res.set(name, value), options ?? {});
  return res;
}

export function setResponseHeaders(
  setHeader: (name: string, value: string) => void,
  { csp = true, xFrame = true }: { csp?: boolean; xFrame?: boolean }
): void {
  [
    ["X-XSS-Protection", "1; mode=block"],
    ["X-Content-Type-Options", "nosniff"],
    ["Strict-Transport-Security", "max-age=63072000"],
    ...(csp && RUNTIME_ENV !== "local"
      ? [["Content-Security-Policy", CSP_VALUE]]
      : []),
    ...(xFrame ? [["X-Frame-Options", "DENY"]] : []),
  ].forEach(([k, v]) => k && v && setHeader(k, v));
}

export function country(res: express.Request): string {
  return res.header("X-Appengine-Country") || "";
}
