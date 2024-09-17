import { SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE } from "../env";

let sentryPromise: Promise<any> | null = null;

function loadSentry(): Promise<any> {
  if (!sentryPromise) {
    sentryPromise = import(
      /* webpackChunkName: "sentry" */ "@sentry/react"
    ).then((Sentry) => {
      Sentry.init({
        dsn: SENTRY_DSN,
        release: SENTRY_RELEASE || "dev",
        environment: SENTRY_ENVIRONMENT || "dev",
      });
      return Sentry;
    });
  }
  return sentryPromise;
}

export function initSentry() {
  if (!SENTRY_DSN) {
    return;
  }
  let removeEventListener: (() => void) | null = null;
  const capturedMessages = new Set<string>();
  const errorHandler = (event: ErrorEvent) => {
    loadSentry().then((Sentry) => {
      if (removeEventListener) {
        removeEventListener();
        removeEventListener = null;
      }
      if (!capturedMessages.has(event.message)) {
        Sentry.captureException(event);
        capturedMessages.add(event.message);
      }
    });
  };
  window.addEventListener("error", errorHandler);
  removeEventListener = () => window.removeEventListener("error", errorHandler);
}
