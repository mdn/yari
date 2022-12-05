import { packageBCD } from "./resolve-bcd";
import * as bcd from "@mdn/browser-compat-data/types";

interface SimpleSupportStatementWithReleaseDate
  extends bcd.SimpleSupportStatement {
  release_date?: string;
  version_last?: bcd.VersionValue;
}

export function extractBCD(query: string): {
  browsers: bcd.Browsers | null;
  data: bcd.Identifier | null;
} {
  const { browsers, data }: { browsers: bcd.Browsers; data: bcd.Identifier } =
    packageBCD(query);

  if (data === undefined) {
    return {
      browsers: null,
      data: null,
    };
  }

  // First extract a map of all release data, keyed by (normalized) browser
  // name and the versions.
  // You'll have a map that looks like this:
  //
  //   'chrome_android': {
  //      '28': {
  //        release_date: '2012-06-01',
  //        release_notes: '...',
  //        ...
  //
  // The reason we extract this to a locally scoped map, is so we can
  // use it to augment the `__compat` blocks for the latest version
  // when (if known) it was added.
  const browserReleaseData = new Map();
  for (const [name, browser] of Object.entries(browsers)) {
    const releaseData = new Map();
    for (const [version, data] of Object.entries(browser.releases || [])) {
      if (data) {
        releaseData.set(version, data);
      }
    }
    browserReleaseData.set(name, releaseData);
  }

  for (const block of _extractCompatBlocks(data)) {
    for (const [browser, originalInfo] of Object.entries(block.support)) {
      // `originalInfo` here will be one of the following:
      //  - a single simple_support_statement:
      //    { version_added: 42 }
      //  - an array of simple_support_statements:
      //    [ { version_added: 42 }, { prefix: '-moz', version_added: 35 } ]
      //
      // Standardize the first version to an array of one, so we don't have
      // to deal with two different forms below
      const infos: SimpleSupportStatementWithReleaseDate[] = Array.isArray(
        originalInfo
      )
        ? originalInfo
        : [originalInfo];

      for (const infoEntry of infos) {
        const added = _normalizeVersion(infoEntry.version_added);
        const removed = _normalizeVersion(infoEntry.version_removed);
        if (browserReleaseData.has(browser)) {
          if (browserReleaseData.get(browser).has(added)) {
            infoEntry.release_date = browserReleaseData
              .get(browser)
              .get(added).release_date;
            infoEntry.version_last = _getPreviousVersion(
              removed,
              browsers[browser]
            );
          }
        }
      }

      infos.sort((a, b) =>
        _compareVersions(_getFirstVersion(b), _getFirstVersion(a))
      );

      block.support[browser] = infos;
    }
  }

  return { data, browsers };
}

function _getPreviousVersion(
  version: bcd.VersionValue,
  browser: bcd.BrowserStatement
): bcd.VersionValue {
  if (browser && typeof version === "string") {
    const browserVersions = Object.keys(browser["releases"]).sort(
      _compareVersions
    );
    const currentVersionIndex = browserVersions.indexOf(version);
    if (currentVersionIndex > 0) {
      return browserVersions[currentVersionIndex - 1];
    }
  }

  return version;
}

function _normalizeVersion(version: bcd.VersionValue): bcd.VersionValue {
  return typeof version === "string" && version.startsWith("≤")
    ? version.slice(1)
    : version;
}

function _getFirstVersion(support: bcd.SimpleSupportStatement): string {
  if (typeof support.version_added === "string") {
    return support.version_added;
  } else if (typeof support.version_removed === "string") {
    return support.version_removed;
  } else {
    return "0";
  }
}

function _compareVersions(a: string, b: string) {
  const x = _splitVersion(a);
  const y = _splitVersion(b);

  return _compareNumberArray(x, y);
}

function _compareNumberArray(a: number[], b: number[]): number {
  while (a.length || b.length) {
    const x = a.shift() || 0;
    const y = b.shift() || 0;
    if (x !== y) {
      return x - y;
    }
  }

  return 0;
}
function _splitVersion(version: string): number[] {
  if (version.startsWith("≤")) {
    version = version.slice(1);
  }

  return version.split(".").map(Number);
}

/**
 * Recursively extracts `__compat` objects from the `feature` and from all
 * nested features at any depth.
 *
 * @param {bcd.Identifier} feature The feature.
 * @returns {bcd.CompatStatement[]} The array of `__compat` objects.
 */
function _extractCompatBlocks(feature: bcd.Identifier): bcd.CompatStatement[] {
  const blocks: bcd.CompatStatement[] = [];
  for (const [key, value] of Object.entries(feature)) {
    if (key === "__compat") {
      blocks.push(value as bcd.CompatStatement);
    } else if (typeof value === "object") {
      blocks.push(..._extractCompatBlocks(value as bcd.Identifier));
    }
  }
  return blocks;
}
