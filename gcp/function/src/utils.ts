import type express from "express";
import { DEFAULT_COUNTRY } from "./constants.js";

export function getRequestCountry(req: express.Request): string {
  // https://cloud.google.com/appengine/docs/flexible/reference/request-headers#app_engine-specific_headers
  const value = req.headers["x-appengine-country"];

  if (typeof value === "string" && value !== "ZZ") {
    return value;
  } else {
    return DEFAULT_COUNTRY;
  }
}
