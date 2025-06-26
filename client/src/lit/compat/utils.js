/**
 * @import { SimpleSupportStatement, VersionValue, CompatStatement, Identifier, SupportStatement, BrowserStatement } from "@mdn/browser-compat-data/types"
 * @import { SupportStatementExtended, SimpleSupportStatementExtended } from "./types"
 */

/**
 */

/**
 * @typedef {Object} Feature
 * @property {string} name
 * @property {CompatStatement} compat
 * @property {number} depth
 */

/**
 * A list of browsers to be hidden.
 * @constant {string[]}
 */
export const HIDDEN_BROWSERS = ["ie"];

/**
 * Gets the first element of an array or returns the value itself.
 *
 * @template T
 * @param {T | [T?, ...any[]]} a
 * @returns {T | undefined}
 */
export function getFirst(a) {
  return Array.isArray(a) ? a[0] : a;
}

/**
 * Ensures the input is returned as an array.
 *
 * @template T
 * @param {T | T[]} a
 * @returns {T[]}
 */
export function asList(a) {
  return Array.isArray(a) ? a : [a];
}

/**
 * Finds the first compatibility depth in a BCD Identifier.
 *
 * @param {Identifier} identifier
 * @returns {number}
 */
function findFirstCompatDepth(identifier) {
  /** @type {Array<[string, Identifier]>} */
  const entries = [["", identifier]];

  do {
    const entry = entries.shift();
    if (!entry) {
      break;
    }
    const [path, value] = entry;
    if (value.__compat) {
      // The depth is the number of segments in the path.
      return path.split(".").length;
    }

    for (const [key, subvalue] of Object.entries(value)) {
      const subpath = path ? `${path}.${key}` : key;
      if ("__compat" in subvalue) {
        entries.push([subpath, subvalue]);
      }
    }
  } while (entries.length);

  // Fallback.
  return 0;
}

/**
 * Recursively lists features from a BCD Identifier.
 *
 * @param {Identifier} identifier
 * @param {string} [parentName=""]
 * @param {string} [rootName=""]
 * @param {number} [depth=0]
 * @param {number} [firstCompatDepth=0]
 * @returns {Feature[]}
 */
export function listFeatures(
  identifier,
  parentName = "",
  rootName = "",
  depth = 0,
  firstCompatDepth = 0
) {
  /** @type {Feature[]} */
  const features = [];

  if (rootName && identifier.__compat) {
    features.push({
      name: rootName,
      compat: identifier.__compat,
      depth,
    });
  }

  if (rootName) {
    firstCompatDepth = findFirstCompatDepth(identifier);
  }

  for (const [subName, subIdentifier] of Object.entries(identifier)) {
    if (subName === "__compat") {
      continue;
    }

    if ("__compat" in subIdentifier && subIdentifier.__compat) {
      features.push({
        name: parentName ? `${parentName}.${subName}` : subName,
        compat: subIdentifier.__compat,
        depth: depth + 1,
      });
    }

    if ("__compat" in subIdentifier /* || depth + 1 < firstCompatDepth*/) {
      features.push(
        ...listFeatures(subIdentifier, subName, "", depth + 1, firstCompatDepth)
      );
    }
  }
  return features;
}

/**
 * Checks if the support statement is an array with more than one item.
 *
 * @param {SupportStatement | undefined} support
 * @returns {boolean}
 */
export function hasMore(support) {
  return Array.isArray(support) && support.length > 1;
}

/**
 * Determines if a version is a preview version.
 *
 * @param {string | VersionValue | undefined} version
 * @param {BrowserStatement} browser
 * @returns {boolean}
 */
export function versionIsPreview(version, browser) {
  if (version === "preview") {
    return true;
  }

  if (browser && typeof version === "string" && browser.releases[version]) {
    return ["beta", "nightly", "planned"].includes(
      browser.releases[version].status
    );
  }

  return false;
}

/**
 * Checks if the support statement has noteworthy notes.
 *
 * @param {SimpleSupportStatement} support
 * @returns {boolean}
 */
export function hasNoteworthyNotes(support) {
  return (
    !!(
      (support.notes && support.notes.length) ||
      (support.impl_url && support.impl_url.length)
    ) &&
    !support.version_removed &&
    !support.partial_implementation
  );
}

/**
 * Converts a bug URL to a simplified string.
 *
 * @param {string} url
 * @returns {string}
 */
export function bugURLToString(url) {
  const match = url.match(
    /^https:\/\/(?:crbug\.com|webkit\.org\/b|bugzil\.la)\/([0-9]+)/i
  );
  const bugNumber = match ? match[1] : null;
  return bugNumber ? `bug ${bugNumber}` : url;
}

/**
 * Checks if a support statement has any limitation.
 *
 * @param {SimpleSupportStatement} support
 * @returns {boolean}
 */
function hasLimitation(support) {
  return hasMajorLimitation(support) || !!support.notes || !!support.impl_url;
}

/**
 * Checks if a support statement has major limitations.
 *
 * @param {SimpleSupportStatement} support
 * @returns {boolean}
 */
function hasMajorLimitation(support) {
  return (
    support.partial_implementation ||
    !!support.alternative_name ||
    !!support.flags ||
    !!support.prefix ||
    !!support.version_removed
  );
}

/**
 * Checks if a support statement is fully supported without any limitation.
 *
 * @param {SimpleSupportStatement} support
 * @returns {boolean}
 */
export function isFullySupportedWithoutLimitation(support) {
  return !!support.version_added && !hasLimitation(support);
}

/**
 * Checks if a support statement is not supported at all.
 *
 * @param {SimpleSupportStatement} support
 * @returns {boolean}
 */
export function isNotSupportedAtAll(support) {
  return support.version_added === false && !hasLimitation(support);
}

/**
 * Checks if a support statement is fully supported without major limitations.
 *
 * @param {SimpleSupportStatement} support
 * @returns {boolean}
 */
function isFullySupportedWithoutMajorLimitation(support) {
  return !!support.version_added && !hasMajorLimitation(support);
}

/**
 * Gets the current support statement from a support statement extended.
 *
 * Prioritizes support items in the following order:
 *   1. Full support without limitation.
 *   2. Full support with only notes and version_added.
 *   3. Full support with alternative name or prefix.
 *   4. Partial support.
 *   5. Support with flags only.
 *   6. No/Inactive support.
 *
 * @param {SupportStatementExtended | undefined} support
 * @returns {SimpleSupportStatementExtended | undefined}
 */
export function getCurrentSupport(support) {
  if (!support) return undefined;

  // Full support without limitation.
  const noLimitationSupportItem = asList(support).find((item) =>
    isFullySupportedWithoutLimitation(item)
  );
  if (noLimitationSupportItem) return noLimitationSupportItem;

  // Full support with only notes and version_added.
  const minorLimitationSupportItem = asList(support).find((item) =>
    isFullySupportedWithoutMajorLimitation(item)
  );
  if (minorLimitationSupportItem) return minorLimitationSupportItem;

  // Full support with alternative name/prefix.
  const altnamePrefixSupportItem = asList(support).find(
    (item) => !item.version_removed && (item.prefix || item.alternative_name)
  );
  if (altnamePrefixSupportItem) return altnamePrefixSupportItem;

  // Partial support.
  const partialSupportItem = asList(support).find(
    (item) => !item.version_removed && item.partial_implementation
  );
  if (partialSupportItem) return partialSupportItem;

  // Support with flags only.
  const flagSupportItem = asList(support).find(
    (item) => !item.version_removed && item.flags
  );
  if (flagSupportItem) return flagSupportItem;

  // No/Inactive support.
  const noSupportItem = asList(support).find((item) => item.version_removed);
  if (noSupportItem) return noSupportItem;

  // Default (likely never reached).
  return getFirst(support);
}
