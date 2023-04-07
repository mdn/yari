import { readFileSync } from "node:fs";
import { createServer as createHttpsServer } from "node:https";

import express from "express";
import { createHandler } from "./app.js";
import { HTTPS_CERT_FILE, HTTPS_KEY_FILE, Origin } from "./env.js";

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
