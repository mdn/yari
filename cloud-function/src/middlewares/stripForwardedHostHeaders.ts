import { NextFunction, Request, Response } from "express";

// Don't strip other `X-Forwarded-*` headers.
const HEADER_REGEXP = /^(x-forwarded-host|forwarded)$/i;

export async function stripForwardedHostHeaders(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  Object.keys(req.headers)
    .filter((name) => HEADER_REGEXP.test(name))
    .forEach((name) => delete req.headers[name]);
  next();
}
