import { readFileSync } from "node:fs";
import { createServer as createHttpsServer } from "node:https";

import express from "express";

import { createHandler } from "./app.js";
import {
  DEBUG_TELEMETRY,
  HTTPS_CERT_FILE,
  HTTPS_KEY_FILE,
  Origin,
} from "./env.js";

const contentApp = express();
const contentPort = 3000;

contentApp.all("*", createHandler(Origin.main));
contentApp.listen(contentPort, () => {
  console.log(`Content app listening on port ${contentPort}`);
});

if (HTTPS_CERT_FILE && HTTPS_KEY_FILE) {
  const PORT = 443;
  createHttpsServer(
    {
      key: readFileSync(HTTPS_KEY_FILE),
      cert: readFileSync(HTTPS_CERT_FILE),
    },
    contentApp
  ).listen(PORT, () =>
    console.log(`Content app listening on port ${PORT} [HTTPS]`)
  );
}

const liveSampleApp = express();
const liveSamplePort = 5042;

liveSampleApp.all("*", createHandler(Origin.liveSamples));
liveSampleApp.listen(liveSamplePort, () => {
  console.log(`Sample app listening on port ${liveSamplePort}`);
});

if (DEBUG_TELEMETRY) {
  const debugApp = express();
  debugApp.all(
    "*",
    express.json(),
    async (req: express.Request, res: express.Response) => {
      const { method, url, query, headers, body } = req;
      const payload = {
        method,
        url,
        headers,
        query,
        body,
      };
      res.setHeader("Content-Type", "application/json"),
        res.write(JSON.stringify(payload));
      res.end();
    }
  );
  debugApp.listen(8888);
}
