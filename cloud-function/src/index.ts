import { createHandler } from "./app.js";
import { http } from "@google-cloud/functions-framework";
import * as Sentry from "@sentry/google-cloud-serverless";

let handler = createHandler();

if (process.env["SENTRY_DSN"]) {
  Sentry.init();
  handler = Sentry.wrapHttpFunction(handler);
}

http("mdnHandler", handler);
