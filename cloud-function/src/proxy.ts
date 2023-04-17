import { readFileSync } from "node:fs";
import { createServer } from "node:https";
import httpProxy from "http-proxy";
import httpServer from "http-server";

import {
  HTTPS_CERT_FILE,
  HTTPS_KEY_FILE,
  LOCAL_BUILD,
  SOURCE_CONTENT,
  SOURCE_LIVE_SAMPLES,
} from "./env.js";

if ([SOURCE_CONTENT, SOURCE_LIVE_SAMPLES].includes(LOCAL_BUILD)) {
  const url = new URL(LOCAL_BUILD);
  const contentServer = httpServer.createServer({
    root: "../client/build",
  });
  contentServer.listen(url.port, () =>
    console.log(`client/build served on port ${url.port}`)
  );
}

if (HTTPS_CERT_FILE && HTTPS_KEY_FILE) {
  const proxy = httpProxy.createProxyServer({
    target: "http://localhost:5100",
  });

  const server = createServer(
    {
      key: readFileSync(HTTPS_KEY_FILE),
      cert: readFileSync(HTTPS_CERT_FILE),
    },
    (req, res) => proxy.web(req, res)
  );

  proxy.on("error", (err) => {
    console.error("Proxy error:", err);

    // Restart the server
    server.close(function () {
      console.log("Server closed");
      server.listen(443, function () {
        console.log("Server restarted");
      });
    });
  });

  server.listen(443, () => console.log(`HTTPS proxy running on port 443`));
} else {
  console.log("HTTPS proxy disabled!");
  console.log(
    "Note: Set HTTPS_CERT_FILE and HTTPS_KEY_FILE in .env to enable it."
  );
  console.log(
    "Hint: Use mkcert to create a locally-trusted development certificate."
  );
}
