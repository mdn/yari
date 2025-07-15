import {
  HIDDEN_BROWSERS,
  asList,
  getFirst,
  hasMore,
  hasNoteworthyNotes,
  listFeatures,
  versionIsPreview,
} from "./utils.js";

/**
 * @import { BrowserName, Browsers, Identifier } from "@mdn/browser-compat-data/types"
 * @typedef {"yes" | "partial" | "preview" | "no" | "unknown" | "experimental" | "nonstandard" | "deprecated" | "footnote" | "disabled" | "altname" | "prefix" | "more"} LegendKey
 */

/**
 * Legend labels which also specifies the order in which the legend appears.
 * @type {Record<LegendKey, string>}
 */
export const LEGEND_LABELS = {
  yes: "Full support",
  partial: "Partial support",
  preview: "In development. Supported in a pre-release version.",
  no: "No support",
  unknown: "Compatibility unknown",
  experimental: "Experimental. Expect behavior to change in the future.",
  nonstandard: "Non-standard. Check cross-browser support before using.",
  deprecated: "Deprecated. Not for use in new websites.",
  footnote: "See implementation notes.",
  disabled: "User must explicitly enable this feature.",
  altname: "Uses a non-standard name.",
  prefix: "Requires a vendor prefix or different name for use.",
  more: "Has more compatibility info.",
};

/**
 * Gets the active legend items based on browser compatibility data.
 *
 * @param {Identifier} compat - The compatibility data identifier.
 * @param {string} name - The name of the feature.
 * @param {Browsers} browserInfo - Information about browsers.
 * @param {BrowserName[]} browsers - The list of displayed browsers.
 * @returns {Array<[LegendKey, string]>} An array of legend item entries, where each entry is a tuple of the legend key and its label.
 */
export function getActiveLegendItems(compat, name, browserInfo, browsers) {
  /** @type {Set<LegendKey>} */
  const legendItems = new Set();

  for (const feature of listFeatures(compat, "", name)) {
    const { status } = feature.compat;

    if (status) {
      if (status.experimental) {
        legendItems.add("experimental");
      }
      if (status.deprecated) {
        legendItems.add("deprecated");
      }
      if (!status.standard_track) {
        legendItems.add("nonstandard");
      }
    }

    for (const browser of browsers) {
      const browserSupport = feature.compat.support[browser] ?? {
        version_added: null,
      };

      if (HIDDEN_BROWSERS.includes(browser)) {
        continue;
      }

      const firstSupportItem = getFirst(browserSupport);
      if (firstSupportItem && hasNoteworthyNotes(firstSupportItem)) {
        legendItems.add("footnote");
      }

      for (const versionSupport of asList(browserSupport)) {
        if (versionSupport.version_added) {
          if (versionSupport.flags && versionSupport.flags.length) {
            legendItems.add("no");
          } else if (
            versionIsPreview(versionSupport.version_added, browserInfo[browser])
          ) {
            legendItems.add("preview");
          } else {
            legendItems.add("yes");
          }
        } else if (versionSupport.version_added == null) {
          legendItems.add("unknown");
        } else {
          legendItems.add("no");
        }

        if (versionSupport.partial_implementation) {
          legendItems.add("partial");
        }
        if (versionSupport.prefix) {
          legendItems.add("prefix");
        }
        if (versionSupport.alternative_name) {
          legendItems.add("altname");
        }
        if (versionSupport.flags) {
          legendItems.add("disabled");
        }
      }

      if (hasMore(browserSupport)) {
        legendItems.add("more");
      }
    }
  }

  const keys = /** @type {LegendKey[]} */ (Object.keys(LEGEND_LABELS));

  return keys
    .filter((key) => legendItems.has(key))
    .map(
      /**
       * @param {LegendKey} key
       */
      (key) => [key, LEGEND_LABELS[key]]
    );
}
