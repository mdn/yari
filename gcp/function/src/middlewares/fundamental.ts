import type express from "express";
import { resolveFundamental } from "@yari-internal/fundamental-redirects";

const THIRTY_DAYS = 3600 * 24 * 30;

export function fundamental(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const { url, status } = resolveFundamental(req.url);
  console.log("fundamental", { url, status });
  if (url) {
    res.set("Cache-Control", `max-age=${THIRTY_DAYS}`);
    if (status) {
      res.redirect(status, url);
    } else {
      res.redirect(url);
    }
  }
  next();
}
