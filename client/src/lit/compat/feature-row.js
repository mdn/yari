import { getCurrentSupport, versionIsPreview } from "./utils.js";
import { html } from "lit";

/**
 * @import { BrowserStatement } from "@mdn/browser-compat-data/types"
 * @import { SupportStatementExtended } from "./types"
 * @typedef {"no"|"yes"|"partial"|"preview"|"removed-partial"|"unknown"} SupportClassName
 */

/**
 * Returns a CSS class name based on support data and the browser.
 *
 * @param {SupportStatementExtended|undefined} support - The extended support statement.
 * @param {BrowserStatement} browser - The browser statement.
 * @returns {SupportClassName}
 */
export function getSupportClassName(support, browser) {
  if (!support) {
    return "unknown";
  }

  const currentSupport = getCurrentSupport(support);
  if (!currentSupport) {
    return "unknown";
  }
  const { flags, version_added, version_removed, partial_implementation } =
    currentSupport;

  /** @type {SupportClassName} */
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

/**
 * Returns a label string derived from a version value.
 *
 * @param {string|boolean|null|undefined} version - The version value.
 * @param {BrowserStatement} browser - The browser statement.
 * @returns {string} The resulting label.
 */
export function labelFromString(version, browser) {
  if (typeof version !== "string") {
    return "?";
  }
  if (version === "preview") {
    return browser.preview_name ?? "Preview";
  }
  // Treat BCD ranges as exact versions to avoid confusion for the reader
  // See https://github.com/mdn/yari/issues/3238
  if (version.startsWith("≤")) {
    version = version.slice(1);
  }
  // New: Omit trailing ".0".
  version = version.replace(/(\.0)+$/g, "");

  return version;
}

/**
 * Generates a version label from added and removed support data.
 *
 * @param {string|boolean|null|undefined} added - The added version.
 * @param {string|boolean|null|undefined} removed - The removed version.
 * @param {BrowserStatement} browser - The browser statement.
 * @returns {import("lit").TemplateResult} A lit-html template result representing the version label.
 */
export function versionLabelFromSupport(added, removed, browser) {
  if (typeof removed !== "string") {
    return html`${labelFromString(added, browser)}`;
  }
  return html`${labelFromString(
    added,
    browser
  )}&#8202;&ndash;&#8202;${labelFromString(removed, browser)}`;
}

/**
 * Retrieves the browser release date from a support statement.
 *
 * @param {SupportStatementExtended|undefined} support - The extended support statement.
 * @returns {string|undefined} The release date if available.
 */
export function getSupportBrowserReleaseDate(support) {
  if (!support) {
    return undefined;
  }

  return getCurrentSupport(support)?.release_date;
}
