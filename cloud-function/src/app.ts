import express, { Request, Response } from "express";
import { Router } from "express";

import { ANY_ATTACHMENT_EXT } from "./internal/constants/index.js";

import { Origin } from "./env.js";
import { proxyContent } from "./handlers/proxy-content.js";
import { proxyApi } from "./handlers/proxy-api.js";
import { handleStripePlans } from "./handlers/handle-stripe-plans.js";
import { proxyTelemetry } from "./handlers/proxy-telemetry.js";
import { lowercasePathname } from "./middlewares/lowercase-pathname.js";
import { resolveIndexHTML } from "./middlewares/resolve-index-html.js";
import { redirectNonCanonicals } from "./middlewares/redirect-non-canonicals.js";
import { redirectLeadingSlash } from "./middlewares/redirect-leading-slash.js";
import { redirectMovedPages } from "./middlewares/redirect-moved-pages.js";
import { redirectEnforceTrailingSlash } from "./middlewares/redirect-enforce-trailing-slash.js";
import { redirectFundamental } from "./middlewares/redirect-fundamental.js";
import { redirectLocale } from "./middlewares/redirect-locale.js";
import { redirectTrailingSlash } from "./middlewares/redirect-trailing-slash.js";
import { requireOrigin } from "./middlewares/require-origin.js";
import { notFound } from "./middlewares/not-found.js";
import { resolveRunnerHtml } from "./middlewares/resolve-runner-html.js";
import { proxyRunner } from "./handlers/proxy-runner.js";
import { stripForwardedHostHeaders } from "./middlewares/stripForwardedHostHeaders.js";
import { proxyPong } from "./handlers/proxy-pong.js";
import { handleRenderHTML } from "./handlers/render-html.js";

const router = Router();
router.use(stripForwardedHostHeaders);
router.use(redirectLeadingSlash);
// MDN Plus plans.
router.all(
  "/api/v1/stripe/plans",
  requireOrigin(Origin.main),
  handleStripePlans
);
// Backend.
router.all(
  ["/api/*", "/admin-api/*", "/events/fxa", "/users/fxa/*"],
  requireOrigin(Origin.main),
  proxyApi
);
// Telemetry.
router.all("/submit/mdn-yari/*", requireOrigin(Origin.main), proxyTelemetry);
router.all("/pong/*", requireOrigin(Origin.main), express.json(), proxyPong);
router.all("/pimg/*", requireOrigin(Origin.main), proxyPong);
// Playground.
router.get(
  ["/[^/]+/docs/*/runner.html", "/[^/]+/blog/*/runner.html", "/runner.html"],
  requireOrigin(Origin.play),
  resolveRunnerHtml,
  proxyRunner
);
// Assets.
router.get(
  ["/assets/*", "/sitemaps/*", "/static/*", "/[^/]+.[^/]+"],
  requireOrigin(Origin.main),
  proxyContent
);
router.get(
  "/[^/]+/search-index.json",
  requireOrigin(Origin.main),
  lowercasePathname,
  proxyContent
);
// Root.
router.get("/", requireOrigin(Origin.main), redirectLocale);
// Live samples.
router.get(
  ["/[^/]+/docs/*/_sample_.*.html", "/[^/]+/blog/*/_sample_.*.html"],
  requireOrigin(Origin.liveSamples),
  resolveIndexHTML,
  proxyContent
);
// Attachments.
router.get(
  `/[^/]+/docs/*/*.(${ANY_ATTACHMENT_EXT.join("|")})`,
  requireOrigin(Origin.main, Origin.liveSamples, Origin.play),
  resolveIndexHTML,
  proxyContent
);
// Pages.
router.use(redirectNonCanonicals);
router.get(
  "/[^/]+/docs/*",
  requireOrigin(Origin.main),
  redirectFundamental,
  redirectLocale,
  redirectTrailingSlash,
  redirectMovedPages,
  resolveIndexHTML,
  handleRenderHTML,
  proxyContent
);
router.get(
  ["/[^/]+/blog($|/*)", "/[^/]+/curriculum($|/*)"],
  requireOrigin(Origin.main),
  redirectLocale,
  redirectEnforceTrailingSlash,
  resolveIndexHTML,
  handleRenderHTML,
  proxyContent
);
// MDN Plus, static pages, etc.
router.get(
  "*",
  requireOrigin(Origin.main),
  redirectFundamental,
  redirectLocale,
  redirectTrailingSlash,
  resolveIndexHTML,
  handleRenderHTML,
  proxyContent
);
router.all("*", notFound);

export function createHandler() {
  return async (req: Request, res: Response) =>
    router(req, res, () => {
      /* noop */
    });
}
