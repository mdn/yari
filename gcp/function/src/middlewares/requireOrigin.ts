import type { NextFunction, Request, Response } from "express";
import { Origin, getOriginFromRequest } from "../env.js";

export function requireOrigin(...expectedOrigins: Origin[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const actualOrigin = getOriginFromRequest(req);

    if (expectedOrigins.includes(actualOrigin)) {
      return next();
    } else {
      return res.status(404).end();
    }
  };
}
