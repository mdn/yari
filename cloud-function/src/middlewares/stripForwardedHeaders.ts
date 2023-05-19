import { NextFunction, Request, Response } from "express";

export async function stripForwardedHeaders(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  Object.keys(req.headers)
    .filter((key) => key.startsWith("x-forwarded-") || key === "forwarded")
    .forEach((key) => delete req.headers[key]);
  next();
}
