import express, { Request, Response } from "express";
import { Router } from "express";
import compression from "compression";

import { Origin } from "./env.js";
import { createContentProxy } from "./handlers/content.js";
import { proxyKevel } from "./handlers/kevel.js";
import { proxyRumba } from "./handlers/rumba.js";
import { stripePlans } from "./handlers/stripe-plans.js";
import { proxyTelemetry } from "./handlers/telemetry.js";
import { pathnameLC } from "./middlewares/pathnameLC.js";
import { resolveIndexHTML } from "./middlewares/resolveIndexHTML.js";
import { redirectLeadingSlash } from "./middlewares/redirectLeadingSlash.js";
import { redirectMovedPages } from "./middlewares/redirectMovedPages.js";
import { redirectFundamental } from "./middlewares/redirectFundamental.js";
import { redirectLocale } from "./middlewares/redirectLocale.js";
import { redirectTrailingSlash } from "./middlewares/redirectTrailingSlash.js";
import { requireOrigin } from "./middlewares/requireOrigin.js";
import { notFound } from "./middlewares/notFound.js";

const proxyContent = createContentProxy();

const router = Router();
router.use(redirectLeadingSlash);
router.all("/api/v1/stripe/plans", requireOrigin(Origin.main), stripePlans);
router.all("/api/*", requireOrigin(Origin.main), proxyRumba);
router.all("/admin-api/*", requireOrigin(Origin.main), proxyRumba);
router.all("/events/fxa/*", requireOrigin(Origin.main), proxyRumba);
router.all("/users/fxa/*", requireOrigin(Origin.main), proxyRumba);
router.all(
  "/submit/mdn-yari/*",
  requireOrigin(Origin.main),
  compression(),
  proxyTelemetry
);
router.all("/pong/*", requireOrigin(Origin.main), express.json(), proxyKevel);
router.all("/pimg/*", requireOrigin(Origin.main), proxyKevel);
router.get("/sitemaps/*", requireOrigin(Origin.main), proxyContent);
router.get("/static/*", requireOrigin(Origin.main), proxyContent);
router.get("/", requireOrigin(Origin.main), redirectLocale);
router.get(
  "/[^/]+/docs/*/_sample_.*.html",
  requireOrigin(Origin.liveSamples),
  pathnameLC,
  proxyContent
);
router.get(
  "/[^/]+/docs/*/*.(png|jpeg|jpg|gif|svg|webp)",
  requireOrigin(Origin.main, Origin.liveSamples),
  pathnameLC,
  proxyContent
);
router.get(
  "/[^/]+/docs/*",
  requireOrigin(Origin.main),
  redirectFundamental,
  redirectLocale,
  redirectTrailingSlash,
  redirectMovedPages,
  resolveIndexHTML,
  proxyContent
);
router.get(
  "/[^/]+/search-index.json",
  requireOrigin(Origin.main),
  pathnameLC,
  proxyContent
);
router.get(
  "*",
  requireOrigin(Origin.main),
  redirectFundamental,
  redirectLocale,
  redirectTrailingSlash,
  resolveIndexHTML,
  proxyContent
);
router.all("*", notFound);

export function createHandler() {
  return async (req: Request, res: Response) =>
    router(req, res, () => {
      /* noop */
    });
}
