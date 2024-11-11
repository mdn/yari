import { withRunnerResponseHeaders } from "../headers.js";
import * as express from "express";

type State = {
  html: string;
  css: string;
  js: string;
  src?: string;
};

function renderHtml(code: State | null = null) {
  const { css, html, js } = code || {
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
    <script>${js}</script>
  </head>
  <body>${html}</body>
</html>
`;
}

async function decompressFromBase64(base64String: string | null) {
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

export async function handleRunner(
  req: express.Request,
  res: express.Response
) {
  const url = new URL(req.url, "https://example.com");
  const data = await decompressFromBase64(url.searchParams.get("state"));
  const json = JSON.parse(data);
  const html = renderHtml(json);
  withRunnerResponseHeaders(null, req, res);
  return res.status(200).send(html);
}
