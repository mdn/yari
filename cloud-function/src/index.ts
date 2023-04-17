import { createHandler } from "./app.js";
import { http } from "@google-cloud/functions-framework";
import { GCPFunction } from "@sentry/serverless";

let handler = createHandler();

if (process.env["SENTRY_DSN"]) {
  GCPFunction.init();
  handler = GCPFunction.wrapHttpFunction(handler);
}

http("mdnHandler", handler);
