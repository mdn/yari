import * as Sentry from "@sentry/react";
import { SENTRY_ENVIRONMENT, SENTRY_RELEASE } from "../env";

export function initSentry(dsn: string) {
  Sentry.init({
    dsn,
    release: SENTRY_RELEASE,
    environment: SENTRY_ENVIRONMENT || "dev",
  });
}
