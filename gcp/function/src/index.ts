import { createHandler } from "./app.js";
import functions from "@google-cloud/functions-framework";

const handler = createHandler();
functions.http("mdnHandler", handler);
