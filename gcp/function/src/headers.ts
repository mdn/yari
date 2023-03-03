import type express from "express";
import { CSP_VALUE } from "@yari-internal/constants";
import { RUNTIME_ENV } from "./env.js";

export function withResponseHeaders(
  res: express.Response,
  { csp = false, xFrame = false }: { csp?: boolean; xFrame?: boolean } = {}
): express.Response {
  [
    ["X-XSS-Protection", "1; mode=block"],
    ["X-Content-Type-Options", "nosniff"],
    ["Strict-Transport-Security", "max-age=63072000"],
    ...(csp && RUNTIME_ENV !== "local"
      ? [["Content-Security-Policy", CSP_VALUE]]
      : []),
    ...(xFrame ? [["X-Frame-Options", "DENY"]] : []),
  ].forEach(([k, v]) => k && v && res.append(k, v));
  return res;
}

export function country(res: express.Request): string {
  return res.header("X-Appengine-Country") || "";
}
