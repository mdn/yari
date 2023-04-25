import express, { Request, Response } from "express";
import { Router } from "express";

import { Origin } from "./env.js";
import { proxyContent } from "./handlers/proxy-content.js";
import { proxyKevel } from "./handlers/proxy-kevel.js";
import { proxyApi } from "./handlers/proxy-api.js";
import { handleStripePlans } from "./handlers/handle-stripe-plans.js";
import { proxyTelemetry } from "./handlers/proxy-telemetry.js";
import { lowercasePathname } from "./middlewares/lowercase-pathname.js";
import { resolveIndexHTML } from "./middlewares/resolve-index-html.js";
import { redirectLeadingSlash } from "./middlewares/redirect-leading-slash.js";
import { redirectMovedPages } from "./middlewares/redirect-moved-pages.js";
import { redirectFundamental } from "./middlewares/redirect-fundamental.js";
import { redirectLocale } from "./middlewares/redirect-locale.js";
import { redirectTrailingSlash } from "./middlewares/redirect-trailing-slash.js";
import { requireOrigin } from "./middlewares/require-origin.js";
import { notFound } from "./middlewares/not-found.js";

const router = Router();
router.use(redirectLeadingSlash);
router.all(
  "/api/v1/stripe/plans",
  requireOrigin(Origin.main),
  handleStripePlans
);
router.all(
  ["/api/*", "/admin-api/*", "/events/fxa", "/users/fxa/*"],
  requireOrigin(Origin.main),
  proxyApi
);
router.all("/submit/mdn-yari/*", requireOrigin(Origin.main), proxyTelemetry);
router.all("/pong/*", requireOrigin(Origin.main), express.json(), proxyKevel);
router.all("/pimg/*", requireOrigin(Origin.main), proxyKevel);
router.get(
  ["/assets/*", "/sitemaps/*", "/static/*", "/[^/]+.[^/]+"],
  requireOrigin(Origin.main),
  proxyContent
);
router.get("/", requireOrigin(Origin.main), redirectLocale);
router.get(
  "/[^/]+/docs/*/_sample_.*.html",
  requireOrigin(Origin.liveSamples),
  resolveIndexHTML,
  proxyContent
);
router.get(
  "/[^/]+/docs/*/*.(png|jpeg|jpg|gif|svg|webp)",
  requireOrigin(Origin.main, Origin.liveSamples),
  resolveIndexHTML,
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
