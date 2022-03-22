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
  isRoot: boolean;
}

export function listFeatures(
  identifier: bcd.Identifier,
  parentName: string = "",
  rootName: string = ""
): Feature[] {
  const features: Feature[] = [];
  if (rootName && identifier.__compat) {
    features.push({
      name: rootName,
      compat: identifier.__compat,
      isRoot: true,
    });
  }

  for (const [subName, subIdentifier] of Object.entries(identifier)) {
    if (subName !== "__compat" && subIdentifier.__compat) {
      features.push({
        name: parentName ? `${parentName}.${subName}` : subName,
        compat: subIdentifier.__compat,
        isRoot: parentName !== "",
      });
      features.push(...listFeatures(subIdentifier, subName));
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

export function needsPrefix(support: bcd.SupportStatement | undefined) {
  return (
    support &&
    getFirst(support).prefix &&
    !asList(support).some(
      (item) =>
        Object.keys(item).filter(
          (x) => !["version_added", "release_date"].includes(x)
        ).length === 0
    )
  );
}
