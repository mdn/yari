import { ReactComponent as PassSVG } from "../../public/assets/observatory/pass-icon.svg";
import { ReactComponent as FailSVG } from "../../public/assets/observatory/fail-icon.svg";
import useSWRMutation from "swr/mutation";
import { OBSERVATORY_API_URL } from "../env";
import useSWRImmutable from "swr/immutable";
import { ObservatoryResult } from "./types";

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
    <a
      href="https://survey.alchemer.com/s3/7897385/MDN-HTTP-Observatory"
      target="_blank"
      rel="noreferrer noopener"
      className="feedback-link"
    >
      Report Feedback
    </a>
  );
}

export const ERROR_MAP = {
  TypeError: "Observatory is currently down.",
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
    let message = `${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) {
        message = data.message;
      }
    } finally {
      throw Error(message);
    }
  }
  return await res.json();
}
