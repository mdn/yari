import type BCD from "@mdn/browser-compat-data/types";
import {
  HIDDEN_BROWSERS,
  asList,
  getFirst,
  hasMore,
  hasNoteworthyNotes,
  listFeatures,
  versionIsPreview,
} from "./utils";

// Also specifies the order in which the legend appears
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
type LEGEND_KEY = keyof typeof LEGEND_LABELS;

export function getActiveLegendItems(
  compat: BCD.Identifier,
  name: string,
  browserInfo: BCD.Browsers
): Array<[LEGEND_KEY, string]> {
  const legendItems = new Set<LEGEND_KEY>();

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

    for (const [browser, browserSupport] of Object.entries(
      feature.compat.support
    ) as Array<[BCD.BrowserName, any]>) {
      if (HIDDEN_BROWSERS.includes(browser)) {
        continue;
      }
      if (!browserSupport) {
        legendItems.add("no");
        continue;
      }
      const firstSupportItem = getFirst(browserSupport);
      if (hasNoteworthyNotes(firstSupportItem)) {
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
  return (Object.keys(LEGEND_LABELS) as LEGEND_KEY[])
    .filter((key) => legendItems.has(key))
    .map((key) => [key, LEGEND_LABELS[key]]);
}
