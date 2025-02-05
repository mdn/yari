import {
  getCurrentSupport,
  SupportStatementExtended,
  versionIsPreview,
} from "./utils.ts";
import type BCD from "@mdn/browser-compat-data/types";
import { html } from "lit";

export function getSupportClassName(
  support: SupportStatementExtended | undefined,
  browser: BCD.BrowserStatement
): "no" | "yes" | "partial" | "preview" | "removed-partial" | "unknown" {
  if (!support) {
    return "unknown";
  }

  let { flags, version_added, version_removed, partial_implementation } =
    getCurrentSupport(support)!;

  let className;
  if (version_added === null) {
    className = "unknown";
  } else if (versionIsPreview(version_added, browser)) {
    className = "preview";
  } else if (version_added) {
    className = "yes";
    if (version_removed || (flags && flags.length)) {
      className = "no";
    }
  } else {
    className = "no";
  }
  if (partial_implementation) {
    className = version_removed ? "removed-partial" : "partial";
  }

  return className;
}

export function labelFromString(
  version: string | boolean | null | undefined,
  browser: BCD.BrowserStatement
) {
  if (typeof version !== "string") {
    return "?";
  }
  // Treat BCD ranges as exact versions to avoid confusion for the reader
  // See https://github.com/mdn/yari/issues/3238
  if (version.startsWith("≤")) {
    return version.slice(1);
  }
  if (version === "preview") {
    return browser.preview_name;
  }
  return version;
}

export function versionLabelFromSupport(
  added: string | boolean | null | undefined,
  removed: string | boolean | null | undefined,
  browser: BCD.BrowserStatement
) {
  if (typeof removed !== "string") {
    return html`${labelFromString(added, browser)}`;
  }
  return html`${labelFromString(
    added,
    browser
  )}&#8202;&ndash;&#8202;${labelFromString(removed, browser)}`;
}

export function getSupportBrowserReleaseDate(
  support: SupportStatementExtended | undefined
): string | undefined {
  if (!support) {
    return undefined;
  }
  return getCurrentSupport(support)!.release_date;
}
