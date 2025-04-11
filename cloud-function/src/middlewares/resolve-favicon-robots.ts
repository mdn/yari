import { NextFunction, Request, Response } from "express";

const MAPPING: Record<string, string> = {
  "/static/favicon.ico": "/favicon.ico",
  "/static/robots.txt": "/robots.txt",
};

/**
 * Workaround for Google Cloud Function always returning HTTP 404 for favicon.ico/robots.txt.
 *
 * See: https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/5679093ecb850ceece3af8b313c0d8aa04870635/src/server.ts#L148-L153
 *
 * From our load balancer, we point to `/static/{favicon.ico,robots.txt}` instead.
 */
export async function resolveFaviconRobots(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const { pathname } = new URL(
    req.url,
    `${req.protocol}://${req.headers.host}`
  );
  console.log({ pathname });
  if (typeof MAPPING[pathname] === "string") {
    req.url = MAPPING[pathname];
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
  }
  next();
}
