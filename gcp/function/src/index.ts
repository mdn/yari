import { handler } from "./app.js";
import functions from "@google-cloud/functions-framework";

functions.http("mdnHandler", handler);
