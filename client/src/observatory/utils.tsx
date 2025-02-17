import useSWRMutation from "swr/mutation";
import useSWRImmutable from "swr/immutable";

import { OBSERVATORY_API_URL } from "../env";

import { ObservatoryResult } from "./types";
import { ReactComponent as PassSVG } from "../../public/assets/observatory/pass-icon.svg";
import { ReactComponent as FailSVG } from "../../public/assets/observatory/fail-icon.svg";
import { HumanDuration } from "./results/human-duration";

export function Link({ href, children }: { href: string; children: any }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${href.startsWith("/") ? "" : "external"}`}
    >
      {children}
    </a>
  );
}

export function PassIcon({ pass }: { pass: boolean | null }) {
  if (pass === null) {
    return <>-</>;
  }
  return (
    <span className="obs-pass-icon">
      {pass ? <PassSVG /> : <FailSVG />}
      <span className="visually-hidden">{pass ? "Passed" : "Failed"}</span>
    </span>
  );
}

export function FeedbackLink() {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href="https://survey.alchemer.com/s3/7897385/MDN-HTTP-Observatory"
      target="_blank"
      rel="noopener"
      className="feedback-link"
    >
      Report Feedback
    </a>
  );
}

export function FaqLink() {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href="/en-US/observatory/docs/faq"
      target="_blank"
      rel="noopener"
      className="feedback-link faq-link"
    >
      Read our FAQ
    </a>
  );
}

export const ERROR_MAP = {
  TypeError: "Observatory is currently down.", // `fetch()` errors catch-all
};

export function formatMinus(term: string | null | undefined) {
  if (!term) {
    return null;
  }
  // replace dash with unicode minus symbol
  // −
  // MINUS SIGN
  // Unicode: U+2212, UTF-8: E2 88 92
  return `${term}`.replaceAll(/-/g, "−");
}

export function useUpdateResult(host: string) {
  return useSWRMutation(
    host,
    async (key: string) => {
      const url = new URL(OBSERVATORY_API_URL + "/api/v2/analyze");
      url.searchParams.set("host", key);
      const res = await fetch(url, {
        method: "POST",
      });
      return await handleJsonResponse<ObservatoryResult>(res);
    },
    { populateCache: true, throwOnError: false }
  );
}

export function useResult(host?: string) {
  return useSWRImmutable(host, async (key) => {
    const url = new URL(OBSERVATORY_API_URL + "/api/v2/analyze");
    url.searchParams.set("host", key);
    const res = await fetch(url);
    return await handleJsonResponse<ObservatoryResult>(res);
  });
}

export async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok && res.status !== 429) {
    // Example error payload we get from the Observatory API:
    // {
    //   "statusCode": 422,
    //   "error": "invalid-hostname-lookup",
    //   "message": "unknownhostmcunknownhostface.mozilla.org cannot be resolved"
    // }
    // We convey the `message` to the user and use the `error` field for glean telemetry.
    let message = `${res.status}: ${res.statusText}`;
    let errName = "Error";
    try {
      const data = await res.json();
      errName = data.error || errName;
      message = data.message || message;
    } finally {
      const err = new Error(message);
      err.name = errName;
      throw err;
    }
  }
  return await res.json();
}

export function Timestamp({ expires }: { expires: string }) {
  const d = new Date(expires);
  if (d.toString() === "Invalid Date") {
    return <div className="iso-date">{expires}</div>;
  }
  const ts = d
    .toISOString()
    .replace("T", " ")
    .replace(/\....Z/, " UTC");
  return (
    <>
      <div className="iso-date">
        <code>{ts}</code>
      </div>
      <div className="humanized-duration">
        (<HumanDuration date={new Date(expires)} />)
      </div>
    </>
  );
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export function hostAsRedirectChain(host: string, result: ObservatoryResult) {
  const chain = result.tests.redirection?.route;
  if (!chain || chain.length < 1) {
    return host;
  }
  try {
    const firstUrl = new URL(chain[0]);
    const lastUrl = new URL(chain[chain.length - 1]);
    if (firstUrl.hostname === lastUrl.hostname) {
      return host;
    }
    return `${firstUrl.hostname} → ${lastUrl.hostname}`;
  } catch (e) {
    return host;
  }
}
