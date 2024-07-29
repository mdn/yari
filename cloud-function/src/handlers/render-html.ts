/* eslint-disable n/no-unsupported-features/node-builtins */
import type { NextFunction, Request, Response } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";

import { captureException } from "@sentry/serverless";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { renderHTML } from "../internal/ssr/main.js";
import { sourceUri, Source } from "../env.js";
import { withRenderedContentResponseHeaders } from "../headers.js";

const target = sourceUri(Source.content);

export async function renderIndexHTML(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.url.endsWith("/index.html")) {
    const html = await renderHTMLForContext(
      req,
      res,
      target.replace(/\/$/, "") + req.url.replace(/html$/, "json")
    );
    res.send(html).end();
  } else {
    next();
  }
}

export async function renderHTMLForContext(
  req: Request,
  res: ServerResponse<IncomingMessage>,
  contextUrl: string
) {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("X-MDN-SSR", "true");
  let context;

  try {
    req.startServerTiming("fetchJSON");
    const contextRes = await fetch(contextUrl);
    req.endServerTiming("fetchJSON");
    if (!contextRes.ok) {
      throw new Error(contextRes.statusText);
    }
    context = await contextRes.json();
    res.statusCode = 200;
  } catch {
    context = { url: req.url, pageNotFound: true };
    res.statusCode = 404;
  }

  try {
    withRenderedContentResponseHeaders(req, res);
    req.startServerTiming("renderHTML");
    const html = renderHTML(context);
    req.endServerTiming("renderHTML");
    return html;
  } catch (e) {
    captureException(e);
    res.statusCode = 500;
    return "Internal Server Error";
  }
}
