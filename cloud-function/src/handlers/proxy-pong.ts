import { BSA_ENABLED, BSA_URL_PREFIX } from "../env.js";
import { proxyBSA } from "./proxy-bsa.js";
import { proxyKevel } from "./proxy-kevel.js";

import type { Request, Response } from "express";

export async function proxyPong(req: Request, res: Response) {
  if (BSA_ENABLED) {
    const referrer = req.get("referrer") || "";
    const version = Number(req.query["version"]) || 1;
    if (referrer.startsWith(BSA_URL_PREFIX) || version === 2) {
      return proxyBSA(req, res);
    }
  }
  return proxyKevel(req, res);
}
