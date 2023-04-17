import type { IncomingMessage, ServerResponse } from "node:http";
import type express from "express";

import { CSP_VALUE } from "./internal/constants/index.js";

const HASHED_MAX_AGE = 60 * 60 * 24 * 365;
const DEFAULT_MAX_AGE = 60 * 60 * 24;

const NO_CACHE_VALUE = "no-store, must-revalidate";

const HASHED_REGEX = /\.[a-f0-9]{8,32}\./;

export function withContentResponseHeaders(
  proxyRes: IncomingMessage,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
): ServerResponse<IncomingMessage> {
  if (res.headersSent) {
    console.warn(
      `Cannot set content response headers. Headers already sent for: ${req.url}`
    );
    return res;
  }

  const url = req.url ?? "";

  const isLiveSampleURI = url.includes("/_sample_.") ?? false;

  setContentResponseHeaders((name, value) => res.setHeader(name, value), {
    csp:
      !isLiveSampleURI &&
      parseContentType(proxyRes.headers["content-type"]).startsWith(
        "text/html"
      ),
    xFrame: !isLiveSampleURI,
  });

  if (req.url?.endsWith("/sitemap.xml.gz")) {
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Content-Encoding", "gzip");
  }

  const cacheControl = getCacheControl(proxyRes.statusCode ?? 0, url);
  if (cacheControl) {
    res.setHeader("Cache-Control", cacheControl);
  }

  return res;
}

function getCacheControl(statusCode: number, url: string) {
  if (
    statusCode === 404 ||
    url.endsWith("/service-worker.js") ||
    url.includes("/_whatsdeployed/")
  ) {
    return NO_CACHE_VALUE;
  }

  if (200 <= statusCode && statusCode < 300) {
    const maxAge = getCacheMaxAgeForUrl(url);
    return `public, max-age=${maxAge}`;
  }

  return null;
}

function getCacheMaxAgeForUrl(url: string): number {
  const isHashed = HASHED_REGEX.test(url);
  const maxAge = isHashed ? HASHED_MAX_AGE : DEFAULT_MAX_AGE;

  return maxAge;
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
