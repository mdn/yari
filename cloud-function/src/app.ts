import express, { Request, Response } from "express";
import { Router } from "express";
import compression from "compression";

import { Origin } from "./env.js";
import { createContentProxy } from "./handlers/content.js";
import { proxyKevel } from "./handlers/kevel.js";
import { proxyRumba } from "./handlers/rumba.js";
import { stripePlans } from "./handlers/stripe-plans.js";
import { proxyTelemetry } from "./handlers/telemetry.js";
import { lowercasePathname } from "./middlewares/lowercase-pathname.js";
import { resolveIndexHTML } from "./middlewares/resolve-index-html.js";
import { redirectLeadingSlash } from "./middlewares/redirect-leading-slash.js";
import { redirectMovedPages } from "./middlewares/redirect-moved-pages.js";
import { redirectFundamental } from "./middlewares/redirect-fundamental.js";
import { redirectLocale } from "./middlewares/redirect-locale.js";
import { redirectTrailingSlash } from "./middlewares/redirect-trailing-slash.js";
import { requireOrigin } from "./middlewares/require-origin.js";
import { notFound } from "./middlewares/not-found.js";

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
  lowercasePathname,
  proxyContent
);
router.get(
  "/[^/]+/docs/*/*.(png|jpeg|jpg|gif|svg|webp)",
  requireOrigin(Origin.main, Origin.liveSamples),
  lowercasePathname,
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
  lowercasePathname,
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
