import type { NextFunction, Request, Response } from "express";

import { Origin, WILDCARD_ENABLED, getOriginFromRequest } from "../env.js";

export function requireOrigin(...expectedOrigins: Origin[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (WILDCARD_ENABLED) {
      return next();
    }

    const actualOrigin = getOriginFromRequest(req);

    if (expectedOrigins.includes(actualOrigin)) {
      return next();
    } else {
      return res.sendStatus(404).end();
    }
  };
}
