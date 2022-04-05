import type bcd from "@mdn/browser-compat-data/types";

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
  compat: bcd.CompatStatement;
  depth: number;
}

export function listFeatures(
  identifier: bcd.Identifier,
  parentName: string = "",
  rootName: string = "",
  depth: number = 0
): Feature[] {
  const features: Feature[] = [];
  if (rootName && identifier.__compat) {
    features.push({
      name: rootName,
      compat: identifier.__compat,
      depth,
    });
  }

  for (const [subName, subIdentifier] of Object.entries(identifier)) {
    if (subName !== "__compat" && subIdentifier.__compat) {
      features.push({
        name: parentName ? `${parentName}.${subName}` : subName,
        compat: subIdentifier.__compat,
        depth: depth + 1,
      });
      features.push(...listFeatures(subIdentifier, subName, "", depth + 1));
    }
  }
  return features;
}

export function versionIsPreview(
  version: bcd.VersionValue | string | undefined,
  browser: bcd.BrowserStatement
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

export function hasNoteworthyNotes(support: bcd.SimpleSupportStatement) {
  return (
    support.notes?.length &&
    !support.version_removed &&
    !support.partial_implementation
  );
}

function hasLimitation(support: bcd.SimpleSupportStatement) {
  return (
    support.partial_implementation ||
    support.alternative_name ||
    support.flags ||
    support.prefix ||
    support.version_removed ||
    support.notes
  );
}

export function isOnlySupportedWithAltName(
  support: bcd.SupportStatement | undefined
) {
  return (
    support &&
    getFirst(support).alternative_name &&
    !asList(support).some((item) => isFullySupportedWithoutLimitation(item))
  );
}

export function isOnlySupportedWithPrefix(
  support: bcd.SupportStatement | undefined
) {
  return (
    support &&
    getFirst(support).prefix &&
    !asList(support).some((item) => isFullySupportedWithoutLimitation(item))
  );
}

export function isFullySupportedWithoutLimitation(
  support: bcd.SimpleSupportStatement
) {
  return support.version_added && !hasLimitation(support);
}

export function isNotSupportedAtAll(support: bcd.SimpleSupportStatement) {
  return !support.version_added && !hasLimitation(support);
}
