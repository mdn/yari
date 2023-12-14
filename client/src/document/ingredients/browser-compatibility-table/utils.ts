import type BCD from "@mdn/browser-compat-data/types";

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

function findFirstCompatDepth(identifier: BCD.Identifier) {
  const entries = [["", identifier]];

  while (entries.length) {
    const [path, value] = entries.shift() as [string, BCD.Identifier];
    if (value.__compat) {
      // Following entries have at least this depth.
      return path.split(".").length;
    }

    for (const key of Object.keys(value)) {
      const subpath = path ? `${path}.${key}` : key;
      entries.push([subpath, value[key]]);
    }
  }

  // Fallback.
  return 0;
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
    firstCompatDepth = findFirstCompatDepth(identifier);
  }
  for (const subName of Object.keys(identifier)) {
    if (subName === "__compat") {
      continue;
    }
    const subIdentifier = identifier[subName];
    if (subIdentifier.__compat) {
      features.push({
        name: parentName ? `${parentName}.${subName}` : subName,
        compat: subIdentifier.__compat,
        depth: depth + 1,
      });
    }
    if (subIdentifier.__compat || depth + 1 < firstCompatDepth) {
      features.push(
        ...listFeatures(subIdentifier, subName, "", depth + 1, firstCompatDepth)
      );
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
  support: BCD.SupportStatement | undefined
): BCD.SimpleSupportStatement | undefined {
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
