import { NextFunction, Request, Response } from "express";

import { THIRTY_DAYS } from "../constants.js";
import { redirect } from "../utils.js";
import { Source, sourceUri } from "../env.js";
import { slugToFolder } from "@yari-internal/slug-utils";

const target = sourceUri(Source.content);

export async function redirectCapitalization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);

  const requestURI = url.pathname;
  const qs = url.search;

  const metadataURL = `${target}${slugToFolder(requestURI).slice(1).toLowerCase()}/metadata.json`;
  const tryMetadata = await fetch(metadataURL);
  if (tryMetadata.ok) {
    const metadata = await tryMetadata.json();
    const mdn_url = metadata.mdn_url;
    if (mdn_url && mdn_url !== requestURI) {
      return redirect(res, mdn_url + qs, {
        cacheControlSeconds: THIRTY_DAYS,
      });
    }
  }

  next();
}
