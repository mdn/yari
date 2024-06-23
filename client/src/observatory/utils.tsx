import { ReactComponent as PassSVG } from "../../public/assets/observatory/pass-icon.svg";
import { ReactComponent as FailSVG } from "../../public/assets/observatory/fail-icon.svg";

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
