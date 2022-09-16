import type BCD from "@mdn/browser-compat-data/types";

// Extended for the fields, beyond the bcd types, that are extra-added
// exclusively in Yari.
interface SimpleSupportStatementExtended extends BCD.SimpleSupportStatement {
  // Known for some support statements where the browser *version* is known,
  // as opposed to just "true" and if the version release date is known.
  release_date?: string;
}

export type SupportStatementExtended =
  | SimpleSupportStatementExtended
  | SimpleSupportStatementExtended[];

export function getFirst<T>(a: T | T[]): T;
export function getFirst<T>(a: T | T[] | undefined): T | undefined {
  return Array.isArray(a) ? a[0] : a;
}

export function asList<T>(a: T | T[]): T[] {
  return Array.isArray(a) ? a : [a];
}

export function isTruthy<T>(t: T | false | undefined | null): t is T {
  return Boolean(t);
}

interface Feature {
  name: string;
  compat: BCD.CompatStatement;
  depth: number;
}

function findAllCompatDepths(
  identifier: BCD.Identifier,
  depths: number[],
  flattenedKey: string
) {
  for (let key in identifier) {
    if (identifier.hasOwnProperty(key)) {
      if (key === "__compat") {
        depths.push(flattenedKey ? flattenedKey.split(".").length : 0);
      }
      const newKey = flattenedKey ? flattenedKey + "." + key : key;
      const subIdentifier = identifier[key];
      if (typeof subIdentifier === "object") {
        findAllCompatDepths(subIdentifier as BCD.Identifier, depths, newKey);
      }
    }
  }
}

export function listFeatures(
  identifier: BCD.Identifier,
  parentName: string = "",
  rootName: string = "",
  depth: number = 0,
  firstCompatDepth: number = 0
): Feature[] {
  const features: Feature[] = [];
  if (rootName && identifier.__compat) {
    features.push({
      name: rootName,
      compat: identifier.__compat,
      depth,
    });
  }
  if (rootName) {
    const compatDepths = [];
    findAllCompatDepths(identifier, compatDepths, "");
    firstCompatDepth = Math.min(...compatDepths);
  }
  for (const [subName, subIdentifier] of Object.entries(identifier)) {
    if (subName !== "__compat") {
      if ((subIdentifier as BCD.Identifier).__compat) {
        features.push({
          name: parentName ? `${parentName}.${subName}` : subName,
          compat: (subIdentifier as BCD.Identifier).__compat!,
          depth: depth + 1,
        });
      }
      if (
        (subIdentifier as BCD.Identifier).__compat ||
        depth + 1 < firstCompatDepth
      ) {
        features.push(
          ...listFeatures(
            subIdentifier as BCD.Identifier,
            subName,
            "",
            depth + 1,
            firstCompatDepth
          )
        );
      }
    }
  }
  return features;
}

export function hasMore(support: BCD.SupportStatement | undefined) {
  return Array.isArray(support) && support.length > 1;
}

export function versionIsPreview(
  version: BCD.VersionValue | string | undefined,
  browser: BCD.BrowserStatement
): boolean {
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

export function hasNoteworthyNotes(support: BCD.SimpleSupportStatement) {
  return (
    support.notes?.length &&
    !support.version_removed &&
    !support.partial_implementation
  );
}

function hasLimitation(support: BCD.SimpleSupportStatement) {
  return hasMajorLimitation(support) || support.notes;
}

function hasMajorLimitation(support: BCD.SimpleSupportStatement) {
  return (
    support.partial_implementation ||
    support.alternative_name ||
    support.flags ||
    support.prefix ||
    support.version_removed
  );
}
export function isFullySupportedWithoutLimitation(
  support: BCD.SimpleSupportStatement
) {
  return support.version_added && !hasLimitation(support);
}

export function isNotSupportedAtAll(support: BCD.SimpleSupportStatement) {
  return !support.version_added && !hasLimitation(support);
}

function isFullySupportedWithoutMajorLimitation(
  support: BCD.SimpleSupportStatement
) {
  return support.version_added && !hasMajorLimitation(support);
}

// Prioritizes support items
export function getCurrentSupport(
  support: SupportStatementExtended | undefined
): SimpleSupportStatementExtended | undefined {
  if (!support) return undefined;

  // Full support without limitation
  const noLimitationSupportItem = asList(support).find((item) =>
    isFullySupportedWithoutLimitation(item)
  );
  if (noLimitationSupportItem) return noLimitationSupportItem;

  // Full support with only notes and version_added
  const minorLimitationSupportItem = asList(support).find((item) =>
    isFullySupportedWithoutMajorLimitation(item)
  );
  if (minorLimitationSupportItem) return minorLimitationSupportItem;

  // Full support with altname/prefix
  const altnamePrefixSupportItem = asList(support).find(
    (item) => !item.version_removed && (item.prefix || item.alternative_name)
  );
  if (altnamePrefixSupportItem) return altnamePrefixSupportItem;

  // Partial support
  const partialSupportItem = asList(support).find(
    (item) => !item.version_removed && item.partial_implementation
  );
  if (partialSupportItem) return partialSupportItem;

  // Support with flags only
  const flagSupportItem = asList(support).find(
    (item) => !item.version_removed && item.flags
  );
  if (flagSupportItem) return flagSupportItem;

  // No/Inactive support
  const noSupportItem = asList(support).find((item) => item.version_removed);
  if (noSupportItem) return noSupportItem;

  // Default (likely never reached)
  return getFirst(support);
}
