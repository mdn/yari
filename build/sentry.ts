import Sentry from "@sentry/node";

export function initSentry(
  dsn: string,
  options?: Omit<Sentry.NodeOptions, "dsn">
) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    ...options,
  });
}
