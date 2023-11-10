import {
  BrowserClient,
  defaultStackParser,
  getCurrentHub,
  makeFetchTransport,
} from "@sentry/browser";

import { SENTRY_ENVIRONMENT, SENTRY_RELEASE } from "../env";

export function initSentry(dsn: string) {
  const client = new BrowserClient({
    dsn,
    release: SENTRY_RELEASE,
    environment: SENTRY_ENVIRONMENT || "dev",
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    integrations: [],
  });

  getCurrentHub().bindClient(client);
}
