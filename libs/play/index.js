import * as crypto from "node:crypto";

import he from "he";

export const ORIGIN_PLAY = process.env["ORIGIN_PLAY"] || "localhost";
export const ORIGIN_MAIN = process.env["ORIGIN_MAIN"] || "localhost";

/** @import { IncomingMessage, ServerResponse } from "http" */
/** @import * as express from "express" */

/**
 * @typedef State
 * @property {string} html
 * @property {string} css
 * @property {string} js
 * @property {string} [src]
 */

/**
 * @param {ServerResponse<IncomingMessage>} res
 */
export function withRunnerResponseHeaders(res) {
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
 * @param {string} hrefWithCode
 * @param {string} searchWithState
 */
export function renderWarning(state, hrefWithCode, searchWithState) {
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
        max-width: min(40rem, 100%);
        grid-template-areas: "warn heading heading" ". p p" ". code code" ". leave continue";
        grid-template-columns: auto 1fr auto;
        gap: 1rem;
      }
      .icon {
        grid-area: warn;
        font-size: 4rem;
        padding: 2rem;
      }

      h1 {
        grid-area: heading;
        margin: auto 0;
      }

      p {
        grid-area: p;
        margin: 0;
      }

      details {
        grid-area: code;
      }

      summary {
        cursor: pointer;
      }

      pre {
        border: 1px solid lightgrey;
        padding: .5rem;
        overflow: scroll;
      }

      a.leave, a.continue {
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
        min-width: 12rem;
        max-width: fit-content;
        justify-content: center;
      }

      .leave {
        grid-area: leave;
        margin: 0 1rem 0 auto;
        background-color: grey;
      }

      .continue {
        grid-area: continue;
        background-color: blue;
      }

      @media screen and (max-width: 640px) {
        main {
          grid-template-areas: "warn warn " "heading heading" "p p" "code code" ". leave" ". continue";
          grid-template-columns: minmax(0, 1fr);
        }
        .leave {
          margin: 0;
        }
      }

    </style>
  </head>
  <body>
    <main>
      <span class="icon">⚠️</span>
      <h1>Caution: This is a demo page</h1>
      <p>You’re about to view a live demo generated using the <a href="https://developer.mozilla.org/en-US/play">MDN Playground</a>. This demo may include custom code created by another user and is intended for testing and exploration only. If you’re uncertain about its contents or would prefer not to proceed, you can open the example in the MDN Playground. Otherwise, feel free to continue and explore the example provided.</p>
      <details>
        <summary>view code</summary>

        <h2>html</h2>
        <pre><code>${he.encode(html.trim())}</code></pre>

        <h2>css</h2>
        <pre><code>${he.encode(css.trim())}</code></pre>

        <h2>js</h2>
        <pre><code>${he.encode(js.trim())}</code></pre>
      </details>
      <a class="leave" href="https://developer.mozilla.org/en-US/play${searchWithState}">Open in Playground</a>
      <a class="continue" href="${hrefWithCode}">Continue</a>
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
    return { state: null, hash: null };
  }
  const bytes = Buffer.from(base64String, "base64");
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 20);
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const decompressionStream = new DecompressionStream("deflate-raw");

  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const decompressedStream = new Response(
    new Blob([bytes]).stream().pipeThrough(decompressionStream)
  ).arrayBuffer();

  const state = new TextDecoder().decode(await decompressedStream);
  return { state, hash };
}

const ORIGIN_PLAY_SUFFIX = `.${ORIGIN_PLAY}`;

/**
 *
 * @param {string} hostname
 */
function playSubdomain(hostname) {
  if (hostname.endsWith(ORIGIN_PLAY_SUFFIX)) {
    return hostname.slice(0, -1 * ORIGIN_PLAY_SUFFIX.length);
  }
  return "";
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function handleRunner(req, res) {
  const url = new URL(req.url, "https://example.com");
  const referer = new URL(
    req.headers["referer"] || "https://example.com",
    "https://example.com"
  );
  const stateParam = url.searchParams.get("state");
  const { state, hash } = await decompressFromBase64(stateParam);

  const isLocalhost = req.hostname === "localhost";
  const hasMatchingHash = playSubdomain(req.hostname) === hash;
  const isIframeOnMDN =
    referer.hostname === ORIGIN_MAIN &&
    req.headers["sec-fetch-dest"] === "iframe";

  if (
    !stateParam ||
    !state ||
    (!isLocalhost && !hasMatchingHash && !isIframeOnMDN)
  ) {
    return res.status(404).end();
  }

  const json = JSON.parse(state);
  const codeParam = url.searchParams.get("code");
  const codeCookie = req.cookies["code"];
  if (req.headers["sec-fetch-dest"] === "iframe" || codeParam === codeCookie) {
    const html = renderHtml(json);
    withRunnerResponseHeaders(res);
    return res.status(200).send(html);
  } else {
    const rand = crypto.randomUUID();
    res.cookie("code", rand, {
      expires: new Date(Date.now() + 60000),
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    const urlWithCode = new URL(url);
    urlWithCode.search = "";
    urlWithCode.searchParams.set("state", stateParam);
    urlWithCode.searchParams.set("code", rand);
    return res
      .status(200)
      .send(
        renderWarning(
          json,
          `${urlWithCode.pathname}${urlWithCode.search}`,
          url.search
        )
      );
  }
}
