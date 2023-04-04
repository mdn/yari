import Sentry from "@sentry/node";
import { CaptureConsole } from "@sentry/integrations";

export function initSentry(
  dsn: string,
  options?: Omit<Sentry.NodeOptions, "dsn" | "integrations">
) {
  Sentry.init({
    dsn,
    integrations: [new CaptureConsole({ levels: ["warn", "error", "assert"] })],
    tracesSampleRate: 1.0,
    ...options,
  });
}
