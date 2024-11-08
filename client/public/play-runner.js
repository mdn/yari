function html(code = null) {
  const initialized = code !== null;
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
    <script>
      //if ("serviceWorker" in navigator) {
      //  navigator.serviceWorker
      //    .register("/play-runner.js", {scope: "/"})
      //    .then((registration) => {

      //      console.log("Service worker registration succeeded in play:", registration);
      //      registration.unregister().then((success) => {
      //        console.log("unregistered", success);
      //      });
      //    })
      //    .catch((error) => {
      //      console.error("Service worker registration failed:", error);
      //    });
      //  }
    </script>
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

async function decompressFromBase64(base64String) {
  function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
  }
  const bytes = base64ToBytes(base64String);

  const decompressionStream = new DecompressionStream("deflate-raw");

  const decompressedStream = new Response(
    new Blob([bytes]).stream().pipeThrough(decompressionStream)
  ).arrayBuffer();

  return new TextDecoder().decode(await decompressedStream);
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const url = new URL(e.request.url);
      console.log(`proxying ${url}`);
      if (!url.pathname.endsWith("/play-runner.html")) {
        return;
      }
      let res;
      let data = await decompressFromBase64(url.searchParams.get("state"));
      const json = JSON.parse(data);

      console.log(`proxying ${data}`);

      return new Response(html(json), {
        headers: {
          "Content-Type": "text/html",
          Server: "MDN",
        },
      });
    })()
  );
});
