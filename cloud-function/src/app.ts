import { Request, Response } from "express";
import { Router } from "express";

const router = Router();
router.use((req, res) => {
  const targetHost = "https://developer.mozilla.org"; // The host you want to redirect to
  const targetUrl = `${targetHost}${req.originalUrl}`; // Preserve the original URL path

  res.redirect(302, targetUrl); // Send a 302 (temporary) redirect to the new host
});

export function createHandler() {
  return async (req: Request, res: Response) =>
    router(req, res, () => {
      /* noop */
    });
}
