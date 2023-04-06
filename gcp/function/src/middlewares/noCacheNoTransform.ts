import type express from "express";

export function noCacheNoTransform(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) {
  req.headers["cache-control"] = "no-cache, no-transform";
  next();
}
