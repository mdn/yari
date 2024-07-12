/* eslint-disable n/no-unsupported-features/node-builtins */
import type { NextFunction, Request, Response } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { renderHTML } from "../internal/ssr/main.js";
import { sourceUri, Source } from "../env.js";
import { withRenderedContentResponseHeaders } from "../headers.js";

const target = sourceUri(Source.content);

export async function handleRenderHTML(
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
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  contextUrl: string
) {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("X-MDN-SSR", "true");
  try {
    const contextRes = await fetch(contextUrl);
    if (!contextRes.ok) {
      throw new Error(contextRes.status.toString());
    }
    const context = await contextRes.json();
    res.statusCode = 200;
    withRenderedContentResponseHeaders(req, res);
    return renderHTML(context);
  } catch {
    res.statusCode = 404;
    withRenderedContentResponseHeaders(req, res);
    const context = { url: req.url, pageNotFound: true };
    return renderHTML(context);
  }
}
