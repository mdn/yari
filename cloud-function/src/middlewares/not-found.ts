import type { Request, Response } from "express";

export async function notFound(_req: Request, res: Response) {
  res.sendStatus(404).end();
}
