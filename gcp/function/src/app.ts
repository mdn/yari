import type express from "express";
import { Router } from "express";
import { Origin, origin } from "./env.js";
import { docs } from "./handlers/content.js";
import { client } from "./handlers/client.js";
import { bcdApi } from "./handlers/bcdApi.js";
import { spa } from "./handlers/spa.js";
import { rumba } from "./handlers/rumba.js";
import { pathnameLC } from "./middlewares/pathnameLC.js";
import { redirects } from "./middlewares/redirects.js";

const mainRouter = Router();
const docsHandler = docs();
mainRouter.get("/bcd/api/*", bcdApi());
mainRouter.all("/api/*", rumba);
mainRouter.all("/users/fxa/*", rumba);
mainRouter.use(redirects);
mainRouter.get("/[^/]+/plus/*", spa);
mainRouter.get("/[^/]+/docs/*", docsHandler);
mainRouter.get("/[^/]+/search-index.json", docsHandler);
mainRouter.get("*", client());

const liveSampleRouter = Router();
liveSampleRouter.use(pathnameLC);
liveSampleRouter.get("/[^/]+/docs/*/_sample_.*.html", client());
liveSampleRouter.get("/[^/]+/docs/*/*.(png|jpeg|jpg|gif|svg|webp)", client());
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
