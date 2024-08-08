import onHeaders from "on-headers";
import { hrtime } from "node:process";

import type { NextFunction, Request, Response } from "express";

export async function addServerTimingHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timers = new Map<string, { start: bigint; diff?: bigint }>();

  req.startServerTiming = (id: string) => {
    timers.set(id, { start: hrtime.bigint() });
  };

  req.endServerTiming = (id: string) => {
    const start = timers.get(id)?.start;
    if (start !== undefined) {
      timers.set(id, { start, diff: hrtime.bigint() - start });
    }
  };

  req.startServerTiming("total");

  onHeaders(res, () => {
    const header = [...timers]
      .map(([id, { start, diff }]) => {
        const time = diff !== undefined ? diff : hrtime.bigint() - start;
        return `${id};dur=${time / BigInt(1e6)}`;
      })
      .join(", ");
    res.setHeader("Server-Timing", header);
  });

  next();
}
