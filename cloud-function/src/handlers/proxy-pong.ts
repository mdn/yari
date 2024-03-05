import { BSA_ENABLED } from "../env.js";
import { proxyBSA } from "./proxy-bsa.js";
import { proxyKevel } from "./proxy-kevel.js";

import type { Request, Response } from "express";

export async function proxyPong(req: Request, res: Response) {
  if (BSA_ENABLED) {
    return proxyBSA(req, res);
  }
  return proxyKevel(req, res);
}
