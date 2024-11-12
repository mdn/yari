import * as express from "express";
import * as crypto from "node:crypto";

import he from "he";

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
 * @param {State | null} state
 * @param {string} href
 */
export function renderWarning(state, href) {
  const { css, html, js } = state || {
    css: "",
    html: "",
    js: "",
  };
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      main {
        font-family: system-ui, sans-serif;
        display: grid;
        margin: 2rem auto;
        max-width: min(40rem, 90vw);
        grid-area: ;
        grid-template-areas: "warn heading heading" ". p p" ". code code" ". leave proceed";
        grid-template-columns: auto 1fr auto;
      }

      .icon {
        grid-area: warn;
        font-size: 4rem;
        padding: 2rem;
      }

      h1 {
        grid-area: heading;
      }

      p {
        grid-area: p;
      }

      details {
        grid-area: code;
      }

      a {
        appearance: button;
        border-radius: .375rem;
        border-width: 0;
        box-sizing: border-box;
        color: white;
        cursor: pointer;
        padding: .375rem 1.25rem;
        user-select: none;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        width: 6rem;
        justify-content: center;
      }

      .leave {
        grid-area: leave;
        margin: 0 1rem 0 auto;
        background-color: grey;
      }

      .proceed {
        grid-area: proceed;
        background-color: blue;
      }
    </style>
  </head>
  <body>
    <main>
      <span class="icon">⚠️</span>
      <h1>Your are about to load user generated code on the MDN Playground!</h1>
      <p>Dolore hic reiciendis consequuntur nam et. Minima aut beatae in voluptatem consequatur sed. Sit qui qui odit unde possimus numquam repudiandae consectetur. Vel voluptatem nisi sint ab. Assumenda accusamus est accusantium quia. Sed aut inventore illum quibusdam magnam.…</p>
      <details>
        <summary>view code</summary>

        <h2>html</h2>
        <pre><code>
          ${he.encode(html.trim())}
        </code></pre>

        <h2>css</h2>
        <pre><code>
          ${he.encode(css.trim())}
        </code></pre>

        <h2>js</h2>
        <pre><code>
          ${he.encode(js.trim())}
        </code></pre>
      </details>
      <a class="leave" href="https://developer.mozilla.org/en-US/play">Leave</a>
      <a class="proceed" href="${href}">Proceed</a>
    </main>
  </body>
</html>`;
}

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
<html lang="en">
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
    return "null";
  }
  const bytes = Buffer.from(base64String, "base64");

  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const decompressionStream = new DecompressionStream("deflate-raw");

  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const decompressedStream = new Response(
    new Blob([bytes]).stream().pipeThrough(decompressionStream)
  ).arrayBuffer();

  return new TextDecoder().decode(await decompressedStream);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */

export async function handleRunner(req, res) {
  const url = new URL(req.url, "https://example.com");
  const data = await decompressFromBase64(url.searchParams.get("state"));
  const json = JSON.parse(data);
  const codeParam = url.searchParams.get("code");
  const codeCookie = req.cookies["code"];
  if (req.headers["sec-fetch-dest"] === "iframe" || codeParam === codeCookie) {
    const html = renderHtml(json);
    withRunnerResponseHeaders(null, req, res);
    return res.status(200).send(html);
  } else {
    const rand = crypto.randomUUID();
    res.cookie("code", rand, {
      expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    url.searchParams.set("code", rand);
    return res
      .status(200)
      .send(renderWarning(json, `${url.pathname}${url.search}`));
  }
}
