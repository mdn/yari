import express from "express";
import { Router } from "express";
import { Origin, origin } from "./env.js";
import { createContentProxy } from "./handlers/content.js";
import { proxyClient } from "./handlers/client.js";
import { proxyBcdApi } from "./handlers/bcdApi.js";
import { proxyKevel } from "./handlers/kevel.js";
import { proxyRumba } from "./handlers/rumba.js";
import { stripePlans } from "./handlers/stripePlans.js";
import { proxyTelemetry } from "./handlers/telemetry.js";
import { pathnameLC } from "./middlewares/pathnameLC.js";
import { contentOriginRequest } from "./middlewares/content-origin-request.js";

const mainRouter = Router();
const proxyContent = createContentProxy();
mainRouter.get("/bcd/api/*", proxyBcdApi());
mainRouter.all("/api/v1/stripe/plans", stripePlans);
mainRouter.all("/api/*", proxyRumba);
mainRouter.all("/admin-api/*", proxyRumba);
mainRouter.all("/events/fxa/*", proxyRumba);
mainRouter.all("/users/fxa/*", proxyRumba);
mainRouter.all("/submit/mdn-yari/*", proxyTelemetry);
mainRouter.all("/pong/*", express.json(), proxyKevel);
mainRouter.all("/pimg/*", proxyKevel);
mainRouter.get("/[^/]+/docs/*", contentOriginRequest, proxyContent);
mainRouter.get("/[^/]+/search-index.json", contentOriginRequest, proxyContent);
mainRouter.get("*", contentOriginRequest, proxyClient());

const liveSampleRouter = Router();
liveSampleRouter.use(pathnameLC);
liveSampleRouter.get("/[^/]+/docs/*/_sample_.*.html", proxyClient());
liveSampleRouter.get(
  "/[^/]+/docs/*/*.(png|jpeg|jpg|gif|svg|webp)",
  proxyClient()
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
