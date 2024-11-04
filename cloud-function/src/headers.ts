import type { IncomingMessage, ServerResponse } from "node:http";

import {
  CSP_VALUE,
  PLAYGROUND_UNSAFE_CSP_VALUE,
} from "./internal/constants/index.js";
import { isLiveSampleURL } from "./utils.js";
import { ORIGIN_TRIAL_TOKEN } from "./env.js";

const HASHED_MAX_AGE = 60 * 60 * 24 * 365;
const DEFAULT_MAX_AGE = 60 * 60;

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

  const isLiveSample = isLiveSampleURL(url);

  setContentResponseHeaders((name, value) => res.setHeader(name, value), {
    csp:
      !isLiveSample &&
      parseContentType(proxyRes.headers["content-type"]).startsWith(
        "text/html"
      ),
    xFrame: !isLiveSample,
  });

  if (req.url?.endsWith("/contributors.txt")) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }

  if (res.statusCode === 200 && req.url?.endsWith("/sitemap.xml.gz")) {
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
  const firstValue = Array.isArray(value) ? (value[0] ?? "") : value;

  return typeof firstValue === "string" ? firstValue : "";
}

export function setContentResponseHeaders(
  setHeader: (name: string, value: string) => void,
  { csp = true, xFrame = true }: { csp?: boolean; xFrame?: boolean }
): void {
  [
    ["X-Content-Type-Options", "nosniff"],
    ["Strict-Transport-Security", "max-age=63072000"],
    ...(csp ? [["Content-Security-Policy", CSP_VALUE]] : []),
    ...(xFrame ? [["X-Frame-Options", "DENY"]] : []),
    ...(ORIGIN_TRIAL_TOKEN ? [["Origin-Trial", ORIGIN_TRIAL_TOKEN]] : []),
  ].forEach(([k, v]) => k && v && setHeader(k, v));
}

export function withRunnerResponseHeaders(
  _proxyRes: IncomingMessage,
  _req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
): void {
  [
    ["X-Content-Type-Options", "nosniff"],
    ["Clear-Site-Data", '"cache", "cookies", "storage"'],
    ["Strict-Transport-Security", "max-age=63072000"],
    ["Content-Security-Policy", PLAYGROUND_UNSAFE_CSP_VALUE],
  ].forEach(([k, v]) => k && v && res.setHeader(k, v));
}
