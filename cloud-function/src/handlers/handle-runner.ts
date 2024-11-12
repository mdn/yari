import { withRunnerResponseHeaders } from "../headers.js";
import * as express from "express";
import * as crypto from "node:crypto";

import {
  renderHtml,
  decompressFromBase64,
  renderWarning,
} from "../internal/play/index.js";

export async function handleRunner(
  req: express.Request,
  res: express.Response
) {
  const url = new URL(req.url, "https://example.com");
  const data = await decompressFromBase64(url.searchParams.get("state"));
  const json = JSON.parse(data);
  const codeParam = url.searchParams.get("code");
  const codeCookie = req.cookies["code"];
  if (req.headers["sec-fetch-dest"] === "iframe" || codeParam === codeCookie) {
    const html = renderHtml(json);
    withRunnerResponseHeaders(null, req, res);
    return res.status(200).send(html);
  } else {
    const rand = crypto.randomUUID();
    res.cookie("code", rand, {
      expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    url.searchParams.set("code", rand);
    return res
      .status(200)
      .send(renderWarning(json, `${url.pathname}${url.search}`));
  }
}
