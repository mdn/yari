import { NextFunction, Request, Response } from "express";

export async function stripXfwdHeaders(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  Object.keys(req.headers)
    .filter((key) => key.startsWith("x-forwarded-"))
    .forEach((key) => delete req.headers[key]);
  next();
}
