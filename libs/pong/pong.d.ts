import { Coder } from "./coding.js";
import { Payload } from "./types.js";

export function createPongGetHandler(
  zoneKeys: object,
  coder: Coder,
  env: { KEVEL_SITE_ID: number; KEVEL_NETWORK_ID: number; SIGN_SECRET: string }
): (
  body: string,
  countryCode: string,
  userAgent: string
) => Promise<{
  statusCode: number;
  payload: { plusAvailabe?: bool; [index: string]: Payload };
}>;

export function createPongClickHandler(coder: Coder): (
  params: URLSearchParams
) => Promise<{
  status: number;
  location: string;
}>;

export function createPongViewedHandler(
  coder: Coder
): (params: URLSearchParams) => Promise<void>;
