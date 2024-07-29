import onHeaders from "on-headers";
import { hrtime } from "node:process";

import type { NextFunction, Request, Response } from "express";

export async function addServerTimingHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timers = new Map<
    string,
    { finished: boolean; hrtime: [number, number] }
  >();

  req.startServerTiming = (id: string) => {
    timers.set(id, { finished: false, hrtime: hrtime() });
  };
  req.endServerTiming = (id: string) => {
    timers.set(id, { finished: true, hrtime: hrtime(timers.get(id)?.hrtime) });
  };

  req.startServerTiming("total");

  onHeaders(res, () => {
    req.endServerTiming("total");
    const header = [...timers]
      .filter(([, { finished }]) => finished)
      .map(
        ([id, { hrtime }]) =>
          `${id};dur=${((hrtime[0] * 1e9 + hrtime[1]) / 1e6).toFixed(0)}`
      )
      .join(", ");
    res.setHeader("Server-Timing", header);
  });

  next();
}
