import type express from "express";
import { Router } from "express";
import { Origin, origin } from "./env.js";
import { docs } from "./handlers/content.js";
import { client } from "./handlers/client.js";
import { bcdApi } from "./handlers/bcdApi.js";
import { spa } from "./handlers/spa.js";
import { rumba } from "./handlers/rumba.js";
import { pathnameLC } from "./middlewares/pathnameLC.js";

const mainRouter = Router();
const docsHandler = docs();
mainRouter.get("/bcd/api/*", bcdApi());
mainRouter.all("/api/*", rumba);
mainRouter.all("/users/fxa/*", rumba);
mainRouter.get("/[^/]+/plus/*", spa);
mainRouter.get("/[^/]+/docs/*", docsHandler);
mainRouter.get("/[^/]+/search-index.json", docsHandler);
mainRouter.get("*", client());

const liveSampleRouter = Router();
liveSampleRouter.use(pathnameLC);
liveSampleRouter.get("/[^/]+/docs/*/_sample_.*.html", client());
liveSampleRouter.get("/[^/]+/docs/*/*.(png|jpeg|jpg|gif|svg|webp)", client());

export async function handler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const rPath = req.path;
  const reqOrigin = origin(req);
  if (reqOrigin === Origin.main && !rPath.includes("/_sample_.")) {
    return mainRouter(req, res, next);
  } else if (reqOrigin === Origin.liveSamples) {
    return liveSampleRouter(req, res, next);
  } else {
    return res.status(404).send();
  }
}
