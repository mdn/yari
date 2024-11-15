import * as express from "express";
import * as crypto from "node:crypto";

import he from "he";

export const ORIGIN_PLAY = process.env["ORIGIN_PLAY"] || "localhost";
export const ORIGIN_MAIN = process.env["ORIGIN_MAIN"] || "localhost";

/** @import { IncomingMessage, ServerResponse } from "http" */

/**
 * @typedef State
 * @property {string} html
 * @property {string} css
 * @property {string} js
 * @property {string} [src]
 */

/**
 * @param {IncomingMessage | null} _proxyRes
 * @param {IncomingMessage} _req
 * @param {ServerResponse<IncomingMessage>} res
 */
export function withRunnerResponseHeaders(_proxyRes, _req, res) {
  [
    ["X-Content-Type-Options", "nosniff"],
    ["Clear-Site-Data", '"cache", "cookies", "storage"'],
    ["Strict-Transport-Security", "max-age=63072000"],
    ["Content-Security-Policy", PLAYGROUND_UNSAFE_CSP_VALUE],
  ].forEach(([k, v]) => k && v && res.setHeader(k, v));
}

/**
 * @param {Record<string, string[]>} csp
 */
function cspToString(csp) {
  return Object.entries(csp)
    .map(([directive, values]) => `${directive} ${values.join(" ")};`)
    .join(" ");
}

const PLAYGROUND_UNSAFE_CSP_SCRIPT_SRC_VALUES = [
  "'self'",
  "https:",
  "'unsafe-eval'",
  "'unsafe-inline'",
  "'wasm-unsafe-eval'",
];

export const PLAYGROUND_UNSAFE_CSP_VALUE = cspToString({
  "default-src": ["'self'", "https:"],
  "script-src": PLAYGROUND_UNSAFE_CSP_SCRIPT_SRC_VALUES,
  "script-src-elem": PLAYGROUND_UNSAFE_CSP_SCRIPT_SRC_VALUES,
  "style-src": [
    "'report-sample'",
    "'self'",
    "https:",
    "'unsafe-inline'",
    "'unsafe-eval'",
  ],
  "img-src": ["'self'", "blob:", "https:", "data:"],
  "base-uri": ["'self'"],
  "worker-src": ["'self'"],
  "manifest-src": ["'self'"],
});

/**
 * @param {State | null} [state=null]
 */
export function renderHtml(state = null) {
  const { css, html, js } = state || {
    css: "",
    html: "",
    js: "",
  };
  return `
<!doctype html>
<html lang="en>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* Legacy css to support existing live samples */
      body {
        padding: 0;
        margin: 0;
      }

      svg:not(:root) {
        display: block;
      }

      .playable-code {
        background-color: #f4f7f8;
        border: none;
        border-left: 6px solid #558abb;
        border-width: medium medium medium 6px;
        color: #4d4e53;
        height: 100px;
        width: 90%;
        padding: 10px 10px 0;
      }

      .playable-canvas {
        border: 1px solid #4d4e53;
        border-radius: 2px;
      }

      .playable-buttons {
        text-align: right;
        width: 90%;
        padding: 5px 10px 5px 26px;
      }
      ${css}
    </style>

    <script>
      const consoleProxy = new Proxy(console, {
        get(target, prop) {
          if (prop === "log" || prop === "error" || prop === "warn") {
            return (...args) => {
              const message = args.join(" ");
              window.parent.postMessage({ typ: "console", prop, message }, "*");
              target[prop](...args);
            };
          }
          return target[prop];
        },
      });

      window.console = consoleProxy;
      window.addEventListener("error", (e) => console.log(e.error));
    </script>
  </head>
  <body>
    ${html}
    <script>${js}</script>
  </body>
</html>
`;
}

/**
 * @param {string | null} base64String
 */
export async function decompressFromBase64(base64String) {
  if (!base64String) {
    return { state: null, hash: null };
  }
  const bytes = Buffer.from(base64String, "base64");
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const decompressionStream = new DecompressionStream("deflate-raw");

  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const decompressedStream = new Response(
    new Blob([bytes]).stream().pipeThrough(decompressionStream)
  ).arrayBuffer();

  const state = new TextDecoder().decode(await decompressedStream);
  return { state, hash };
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */

const ORIGIN_PLAY_SUFFIX = `.${ORIGIN_PLAY}`;

/**
 *
 * @param {string} hostname
 */
function playSubdomain(hostname) {
  if (hostname.endsWith(ORIGIN_PLAY_SUFFIX)) {
    return hostname.split(0, -1 * ORIGIN_PLAY_SUFFIX.length);
  }
  return "";
}

export async function handleRunner(req, res) {
  const url = new URL(req.url, "https://example.com");
  const referer = new URL(
    req.headers["referer"] || "https://example.com",
    "https://example.com"
  );
  const { state, hash } = await decompressFromBase64(
    url.searchParams.get("state")
  );
  // If there's no state or
  // if we're not on localhost and neither:
  // the hash and subdomain don't match
  // or we're in and iframe on mdn
  // then 404.
  if (
    !state ||
    !(
      req.hostname === "localhost" ||
      playSubdomain(req.hostname) === hash ||
      (referer.hostname === ORIGIN_MAIN &&
        req.headers["sec-fetch-dest"] === "iframe")
    )
  ) {
    return res.status(404).end();
  }

  const json = JSON.parse(state);
  const html = renderHtml(json);
  withRunnerResponseHeaders(null, req, res);
  return res.status(200).send(html);
}
