import { BSA_ENABLED, BSA_URL_PREFIX } from "../env.js";
import { proxyBSA } from "./proxy-bsa.js";
import { proxyKevel } from "./proxy-kevel.js";

import type { Request, Response } from "express";

export async function proxyPong(req: Request, res: Response) {
  console.log(BSA_ENABLED, BSA_URL_PREFIX, req.get("referrer"));
  if (BSA_ENABLED) {
    const referrer = req.get("referrer") || "";
    if (referrer.startsWith(BSA_URL_PREFIX)) {
      return proxyBSA(req, res);
    }
  }
  return proxyKevel(req, res);
}
