import { Coder } from "./coding.js";

export function fallbackHandler(
  coder: Coder,
  carbonZoneKey: string,
  userAgent: string,
  anonymousIp: string
): Promise<{
  click: string;
  view: string;
  image: string;
  copy: string;
  by: string;
}>;
