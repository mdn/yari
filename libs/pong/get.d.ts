import { Client } from "@adzerk/decision-sdk";
import { Coder } from "./coding.js";

type Payload =
  | {
      click: string;
      view: string;
      fallback: {
        click: string;
        view: string;
        image: string;
        copy: string;
        by: string;
      };
    }
  | {
      copy: string;
      image: string;
      click: string;
      view: string;
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
