import type { NextFunction, Request, Response } from "express";

import { Origin, getOriginFromRequest } from "../env.js";

export function requireOrigin(...expectedOrigins: Origin[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const actualOrigin = getOriginFromRequest(req);

    if (expectedOrigins.includes(actualOrigin)) {
      next();
    } else {
      res.sendStatus(404).end();
    }
  };
}
