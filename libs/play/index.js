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
 * @property {"ix-tabbed" | "ix-wat"} [defaults]
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
  "connect-src": ["'self'", "https:", "data:"],
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
 * @param {TemplateStringsArray} strings
 * @param  {any[]} args
 */
function html(strings, ...args) {
  return strings
    .map((value, index) => `${value}${index < args.length ? args[index] : ""}`)
    .join("");
}

/**
 * @param {State | null} state
 * @param {string} hrefWithCode
 * @param {string} searchWithState
 */
export function renderWarning(state, hrefWithCode, searchWithState) {
  const {
    css,
    html: htmlCode,
    js,
  } = state || {
    css: "",
    html: "",
    js: "",
  };
  return html` <!doctype html>
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
            padding: 0.5rem;
            overflow: scroll;
          }

          a.leave,
          a.continue {
            appearance: button;
            border-radius: 0.375rem;
            border-width: 0;
            box-sizing: border-box;
            color: white;
            cursor: pointer;
            padding: 0.375rem 1.25rem;
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
          <p>
            You’re about to view a live demo generated using the
            <a href="https://developer.mozilla.org/en-US/play">MDN Playground</a
            >. This demo may include custom code created by another user and is
            intended for testing and exploration only. If you’re uncertain about
            its contents or would prefer not to proceed, you can open the
            example in the MDN Playground. Otherwise, feel free to continue and
            explore the example provided.
          </p>
          <details>
            <summary>view code</summary>

            <h2>html</h2>
            <pre><code>${he.encode(htmlCode.trim())}</code></pre>

            <h2>css</h2>
            <pre><code>${he.encode(css.trim())}</code></pre>

            <h2>js</h2>
            <pre><code>${he.encode(js.trim())}</code></pre>
          </details>
          <a
            class="leave"
            href="https://developer.mozilla.org/en-US/play${searchWithState}"
            >Open in Playground</a
          >
          <a class="continue" href="${hrefWithCode}">Continue</a>
        </main>
      </body>
    </html>`;
}

/**
 * @param {State | null} [state=null]
 */
export function renderHtml(state = null) {
  const {
    css,
    html: htmlCode,
    js,
    defaults,
  } = state || {
    css: "",
    html: "",
    js: "",
  };
  return html`
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
        </style>
        ${defaults === "ix-tabbed"
          ? html`<style>
              @font-face {
                font-family: "Inter";
                src:
                  url("/shared-assets/fonts/Inter.var.woff2")
                    format("woff2 supports variations"),
                  url("/shared-assets/fonts/Inter.var.woff2")
                    format("woff2-variations");
                font-weight: 1 999;
                font-stretch: 75% 100%;
                font-style: oblique 0deg 20deg;
                font-display: swap;
              }

              /* fonts used by the examples rendered inside the shadow dom. Because
                 @font-face does not work in shadow dom:
                 http://robdodson.me/at-font-face-doesnt-work-in-shadow-dom/ */
              @font-face {
                font-family: "Fira Sans";
                src:
                  local("FiraSans-Regular"),
                  url("/shared-assets/fonts/FiraSans-Regular.woff2")
                    format("woff2");
              }

              @font-face {
                font-family: "Fira Sans";
                font-weight: normal;
                font-style: oblique;
                src:
                  local("FiraSans-SemiBoldItalic"),
                  url("/shared-assets/fonts/FiraSans-SemiBoldItalic.woff2")
                    format("woff2");
              }

              @font-face {
                font-family: "Dancing Script";
                src: url("/shared-assets/fonts/dancing-script/dancing-script-regular.woff2")
                  format("woff2");
              }

              @font-face {
                font-family: molot;
                src: url("/shared-assets/fonts/molot.woff2") format("woff2");
              }

              @font-face {
                font-family: rapscallion;
                src: url("/shared-assets/fonts/rapscall.woff2") format("woff2");
              }

              body {
                background-color: #fff;
                font:
                  400 1rem/1.1876 Inter,
                  BlinkMacSystemFont,
                  "Segoe UI",
                  "Roboto",
                  "Oxygen",
                  "Ubuntu",
                  "Cantarell",
                  "Fira Sans",
                  "Droid Sans",
                  "Helvetica Neue",
                  sans-sans;
                color: #15141aff;
                font-size: 0.9rem;
                line-height: 1.5;
                padding: 2rem 1rem 1rem;
                min-width: min-content;
              }

              body math {
                font-size: 1.5rem;
              }
            </style>`
          : ""}
        <style id="css-output">
          ${css}
        </style>

        <script>
          const consoleProxy = new Proxy(console, {
            get(target, prop) {
              if (typeof target[prop] === "function") {
                return (...args) => {
                  try {
                    window.parent.postMessage(
                      { typ: "console", prop, args },
                      "*"
                    );
                  } catch {
                    try {
                      window.parent.postMessage(
                        {
                          typ: "console",
                          prop,
                          args: args.map((x) => {
                            try {
                              window.structuredClone(x);
                              return x;
                            } catch {
                              return {
                                _MDNPlaySerializedObject: x.toString(),
                              };
                            }
                          }),
                        },
                        "*"
                      );
                    } catch {
                      window.parent.postMessage(
                        {
                          typ: "console",
                          prop: "warn",
                          args: [
                            "[Playground] Unsupported console message (see browser console)",
                          ],
                        },
                        "*"
                      );
                    }
                  }
                  target[prop](...args);
                };
              }
              return target[prop];
            },
          });

          window.console = consoleProxy;
          window.addEventListener("error", (e) => console.log(e.error));
        </script>
        ${defaults === "ix-tabbed"
          ? html`<script>
              window.addEventListener("click", (event) => {
                // open links in parent frame if they have no "_target" set
                const target = event.target;
                if (
                  target instanceof HTMLAnchorElement ||
                  target instanceof HTMLAreaElement
                ) {
                  const hrefAttr = target.getAttribute("href");
                  const targetAttr = target.getAttribute("target");
                  if (hrefAttr && !hrefAttr.startsWith("#") && !targetAttr) {
                    target.target = "_parent";
                  }
                }
              });
            </script>`
          : ""}
      </head>
      <body>
        ${htmlCode}
        <script type="${defaults === "ix-wat" ? "module" : ""}">
          ${js};
        </script>
      </body>
    </html>
  `;
}

/**
 * @param {string | null} base64String
 *
 * This is the Node.js version of `client/src/playground/utils.ts`. Keep in sync!
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
 * @param {URL} referer
 */
function isMDNReferer(referer) {
  const { hostname } = referer;
  return (
    hostname === ORIGIN_MAIN ||
    // Review Companion (old/new).
    hostname.endsWith(`.content.dev.mdn.mozit.cloud`) ||
    hostname.endsWith(`.review.mdn.allizom.net`)
  );
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function handleRunner(req, res) {
  const url = new URL(req.url, "https://example.com");
  if (url.searchParams.has("blank")) {
    return res.setHeader("Content-Type", "text/html").status(200).end();
  }
  const referer = new URL(
    req.headers["referer"] || "https://example.com",
    "https://example.com"
  );
  const stateParam = url.searchParams.get("state");
  const { state, hash } = await decompressFromBase64(stateParam);

  const isLocalhost = req.hostname === "localhost";
  const hasMatchingHash = playSubdomain(req.hostname) === hash;
  const isIframeOnMDN =
    isMDNReferer(referer) && req.headers["sec-fetch-dest"] === "iframe";

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
