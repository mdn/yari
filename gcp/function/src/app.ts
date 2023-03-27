import express from "express";
import { Router } from "express";
import { Origin, origin } from "./env.js";
import { createContentProxy } from "./handlers/content.js";
import { proxyKevel } from "./handlers/kevel.js";
import { proxyRumba } from "./handlers/rumba.js";
import { plans } from "./handlers/plans.js";
import { proxyTelemetry } from "./handlers/telemetry.js";
import { pathnameLC } from "./middlewares/pathnameLC.js";
import { resolveIndexHTML } from "./middlewares/resolveIndexHTML.js";
import { redirectLeadingSlash } from "./middlewares/redirectLeadingSlash.js";
import { redirectMovedPages } from "./middlewares/redirectMovedPages.js";
import { redirectFundamental } from "./middlewares/redirectFundamental.js";
import { redirectLocale } from "./middlewares/redirectLocale.js";
import { redirectTrailingSlash } from "./middlewares/redirectTrailingSlash.js";

const mainRouter = Router();
const proxyContent = createContentProxy();
mainRouter.use(redirectLeadingSlash);
mainRouter.all("/api/v1/stripe/plans", plans);
mainRouter.all("/api/*", proxyRumba);
mainRouter.all("/admin-api/*", proxyRumba);
mainRouter.all("/events/fxa/*", proxyRumba);
mainRouter.all("/users/fxa/*", proxyRumba);
mainRouter.all("/submit/mdn-yari/*", proxyTelemetry);
mainRouter.all("/pong/*", express.json(), proxyKevel);
mainRouter.all("/pimg/*", proxyKevel);
mainRouter.get("/static/*", proxyContent);
mainRouter.get(
  "/[^/]+/docs/*",
  redirectFundamental,
  redirectLocale,
  redirectTrailingSlash,
  redirectMovedPages,
  resolveIndexHTML,
  proxyContent
);
mainRouter.get("/[^/]+/search-index.json", pathnameLC, proxyContent);
mainRouter.get(
  "*",
  redirectFundamental,
  redirectLocale,
  redirectTrailingSlash,
  resolveIndexHTML,
  proxyContent
);

const liveSampleRouter = Router();
liveSampleRouter.use(pathnameLC);
liveSampleRouter.get("/[^/]+/docs/*/_sample_.*.html", proxyContent);
liveSampleRouter.get(
  "/[^/]+/docs/*/*.(png|jpeg|jpg|gif|svg|webp)",
  proxyContent
);
liveSampleRouter.get("*", (_req: express.Request, res: express.Response) =>
  res.status(404).send()
);

export function createHandler(o?: Origin) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction = () => {
      /* noop */
    }
  ) => {
    const rPath = req.path;
    const reqOrigin = o || origin(req);
    if (reqOrigin === Origin.main && !rPath.includes("/_sample_.")) {
      return mainRouter(req, res, next);
    } else if (reqOrigin === Origin.liveSamples) {
      return liveSampleRouter(req, res, next);
    } else {
      return res.status(404).send();
    }
  };
}
