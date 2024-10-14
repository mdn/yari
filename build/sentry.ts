import { init, captureConsoleIntegration, NodeOptions } from "@sentry/node";

export function initSentry(
  dsn: string,
  options?: Omit<NodeOptions, "dsn" | "environment" | "integrations">
) {
  init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || "dev",
    integrations: [
      captureConsoleIntegration({ levels: ["warn", "error", "assert"] }),
    ],
    tracesSampleRate: 1.0,
    ...options,
  });
}
