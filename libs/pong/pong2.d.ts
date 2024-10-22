import { Coder } from "./coding.js";
import { Payload } from "./types.js";

export function createPong2GetHandler(
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

export function createPong2ClickHandler(coder: Coder): (
  params: URLSearchParams,
  countryCode: string,
  userAgent: string
) => Promise<{
  status: number;
  location: string;
}>;

export function createPong2ViewedHandler(
  coder: Coder
): (
  params: URLSearchParams,
  countryCode: string,
  userAgent: string
) => Promise<void>;
