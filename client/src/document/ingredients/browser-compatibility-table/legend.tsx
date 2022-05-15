import { useContext } from "react";
import { useTranslation } from "react-i18next";
import type bcd from "@mdn/browser-compat-data/types";
import { BrowserInfoContext } from "./browser-info";
import {
  asList,
  getFirst,
  hasNoteworthyNotes,
  listFeatures,
  versionIsPreview,
} from "./utils";

// Specifies the order in which the legend appears
export const LEGEND_KEYS = [
  "yes",
  "partial",
  "preview",
  "no",
  "unknown",
  "experimental",
  "nonstandard",
  "deprecated",
  "footnote",
  "disabled",
  "altname",
  "prefix",
];

function getActiveLegendItems(
  compat: bcd.Identifier,
  name: string,
  browserInfo: bcd.Browsers
) {
  const legendItems = new Set<string>();

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
    }
  }
  return LEGEND_KEYS.filter((key) => legendItems.has(key));
}

export function Legend({
  compat,
  name,
}: {
  compat: bcd.Identifier;
  name: string;
}) {
  const browserInfo = useContext(BrowserInfoContext);
  const { t } = useTranslation("bcd");

  if (!browserInfo) {
    throw new Error(t("error.missingBrowserInfo"));
  }

  return (
    <section className="bc-legend">
      <h3 className="visually-hidden" id="Legend">
        Legend
      </h3>
      <dl className="bc-legend-items-container">
        {getActiveLegendItems(compat, name, browserInfo).map((key) => {
          const label = t(`compatLabels.${key}.title`);
          return ["yes", "partial", "no", "unknown", "preview"].includes(
            key
          ) ? (
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
          );
        })}
      </dl>
    </section>
  );
}
