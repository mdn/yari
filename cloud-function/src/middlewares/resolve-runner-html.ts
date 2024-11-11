import { NextFunction, Request, Response } from "express";

export async function resolveRunnerHtml(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const urlParsed = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  const runner = urlParsed.pathname?.endsWith("/runner.html")
    ? "/runner.html"
    : undefined;
  if (runner) {
    urlParsed.pathname = runner;
    req.url = urlParsed.toString();
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
  }
  next();
}
