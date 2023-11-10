import { SENTRY_ENVIRONMENT, SENTRY_RELEASE } from "../env";

export function initSentry(dsn: string) {
  let initSentry: Promise<any> | null = null;
  const errorHandler = (event: ErrorEvent) => {
    if (!initSentry) {
      initSentry = import(
        /* webpackChunkName: "sentry" */ "@sentry/react"
      ).then((Sentry) => {
        Sentry.init({
          dsn,
          release: SENTRY_RELEASE,
          environment: SENTRY_ENVIRONMENT || "dev",
        });
        return Sentry;
      });
    }
    initSentry.then((Sentry) => Sentry.captureException(event));
  };
  window.addEventListener("error", errorHandler);
}
