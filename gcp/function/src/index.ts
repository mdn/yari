import { handler } from "./app.js";
import functions from "@google-cloud/functions-framework";

functions.http("mdnHandler", (req, res) =>
  handler(req, res, () => {
    /* noop */
  })
);
