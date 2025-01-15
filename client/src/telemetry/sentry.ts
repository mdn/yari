import { SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE } from "../env";

let sentryPromise: Promise<any> | null = null;

/**
 * Loads the Sentry module asynchronously and initializes it.
 * Utilizes dynamic import to split Sentry related code into a separate chunk.
 * Ensures Sentry is only loaded and initialized once.
 *
 * @returns A promise resolving to the initialized Sentry object.
 */
function loadSentry(): Promise<any> {
  if (!sentryPromise) {
    sentryPromise = import(
      /* webpackChunkName: "sentry" */ "@sentry/browser"
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

  let onNextError: (() => void) | null = null;
  const capturedMessages = new Set<string>();

  const handleError = (event: ErrorEvent) => {
    loadSentry().then((Sentry) => {
      if (onNextError) {
        onNextError();
        onNextError = null;
      }
      if (!capturedMessages.has(event.message)) {
        // Capture every error only once.
        Sentry.captureException(event);
        capturedMessages.add(event.message);
      }
    });
  };

  // To avoid capturing too many events, we stop listening after the first error.
  onNextError = () => window.removeEventListener("error", handleError);

  window.addEventListener("error", handleError);
}
