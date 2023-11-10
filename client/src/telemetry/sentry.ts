import { SENTRY_ENVIRONMENT, SENTRY_RELEASE } from "../env";

export function initSentry(dsn: string) {
  let events: ErrorEvent[] = [];
  const errorHandler = (event: ErrorEvent) => {
    events.push(event);
  };
  window.addEventListener("error", errorHandler);
  import(/* webpackChunkName: "sentry" */ "@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn,
      release: SENTRY_RELEASE,
      environment: SENTRY_ENVIRONMENT || "dev",
    });
    window.removeEventListener("error", errorHandler);
    for (const event of events) {
      Sentry.captureException(event);
    }
  });
}
