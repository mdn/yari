import { useContext } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '@mdn/browser-compat-data/types... Remove this comment to see the full error message
import type bcd from "@mdn/browser-compat-data/types";
import { BrowserInfoContext } from "./browser-info";
import {
  asList,
  getFirst,
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
};
type LEGEND_KEY = keyof typeof LEGEND_LABELS;

function getActiveLegendItems(
  compat: bcd.Identifier,
  name: string,
  browserInfo: bcd.Browsers
) {
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
    )) {
      if (!browserSupport) {
        legendItems.add("no");
        continue;
      }
      const firstSupportItem = getFirst(browserSupport);
      if (hasNoteworthyNotes(firstSupportItem)) {
        legendItems.add("footnote");
      }

      for (const versionSupport of asList(browserSupport)) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'version_added' does not exist on type 'u... Remove this comment to see the full error message
        if (versionSupport.version_added) {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'flags' does not exist on type 'unknown'.
          if (versionSupport.flags && versionSupport.flags.length) {
            legendItems.add("no");
          } else if (
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'version_added' does not exist on type 'u... Remove this comment to see the full error message
            versionIsPreview(versionSupport.version_added, browserInfo[browser])
          ) {
            legendItems.add("preview");
          } else {
            legendItems.add("yes");
          }
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'version_added' does not exist on type 'u... Remove this comment to see the full error message
        } else if (versionSupport.version_added == null) {
          legendItems.add("unknown");
        } else {
          legendItems.add("no");
        }

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'partial_implementation' does not exist o... Remove this comment to see the full error message
        if (versionSupport.partial_implementation) {
          legendItems.add("partial");
        }
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'prefix' does not exist on type 'unknown'... Remove this comment to see the full error message
        if (versionSupport.prefix) {
          legendItems.add("prefix");
        }
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'alternative_name' does not exist on type... Remove this comment to see the full error message
        if (versionSupport.alternative_name) {
          legendItems.add("altname");
        }
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'flags' does not exist on type 'unknown'.
        if (versionSupport.flags) {
          legendItems.add("disabled");
        }
      }
    }
  }
  return Object.keys(LEGEND_LABELS)
    .filter((key) => legendItems.has(key as LEGEND_KEY))
    .map((key) => [key, LEGEND_LABELS[key]]);
}

export function Legend({
  compat,
  name,
}: {
  compat: bcd.Identifier;
  name: string;
}) {
  const browserInfo = useContext(BrowserInfoContext);

  if (!browserInfo) {
    throw new Error("Missing browser info");
  }

  return (
    <section className="bc-legend">
      <h3 className="visually-hidden" id="Legend">
        Legend
      </h3>
      <dl className="bc-legend-items-container">
        {getActiveLegendItems(compat, name, browserInfo).map(([key, label]) =>
          ["yes", "partial", "no", "unknown", "preview"].includes(key) ? (
            <div className="bc-legend-item" key={key}>
              <dt className="bc-legend-item-dt" key={key}>
                <span className={`bc-supports-${key} bc-supports`}>
                  <abbr
                    className={`bc-level bc-level-${key} icon icon-${key}`}
                    title={label}
                  >
                    <span className="visually-hidden">{label}</span>
                  </abbr>
                </span>
              </dt>
              <dd className="bc-legend-item-dd">{label}</dd>
            </div>
          ) : (
            <div className="bc-legend-item" key={key}>
              <dt className="bc-legend-item-dt">
                <abbr
                  className={`legend-icons icon icon-${key}`}
                  title={label}
                ></abbr>
              </dt>
              <dd className="bc-legend-item-dd">{label}</dd>
            </div>
          )
        )}
      </dl>
    </section>
  );
}
