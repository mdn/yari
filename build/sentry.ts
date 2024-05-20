import Sentry from "@sentry/node";

export function initSentry(
  dsn: string,
  options?: Omit<Sentry.NodeOptions, "dsn" | "environment" | "integrations">
) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || "dev",
    integrations: [
      Sentry.captureConsoleIntegration({ levels: ["warn", "error", "assert"] }),
    ],
    tracesSampleRate: 1.0,
    ...options,
  });
}
