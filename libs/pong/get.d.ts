import { Client } from "@adzerk/decision-sdk";
import { Coder } from "./coding.js";

type Fallback = {
  click: string;
  view: string;
  copy: string;
  image: string;
  by: string;
};

type Colors = {
  textColor?: string;
  backgroundColor?: string;
  ctaTextColor?: string;
  ctaBackgroundColor?: string;
};

type Payload = {
  status: Status;
  click: string;
  view: string;
  copy?: string;
  image?: string;
  fallback?: Fallback;
  cta?: string;
  colors?: Colors;
};

export function createPongGetHandler(
  client: Client,
  coder: Coder,
  env: { KEVEL_SITE_ID: number; KEVEL_NETWORK_ID: number; SIGN_SECRET: string }
): (
  body: string,
  countryCode: string,
  userAgent: string
) => Promise<{
  statusCode: number;
  payload: Payload;
}>;
