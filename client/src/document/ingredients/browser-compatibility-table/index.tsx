import React, { useReducer } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { browsers as browserData } from "@mdn/browser-compat-data";
import type bcd from "@mdn/browser-compat-data/types";
import { BrowserInfoContext } from "./browser-info";
import { BrowserCompatibilityErrorBoundary } from "./error-boundary";
import { FeatureRow } from "./feature-row";
import { Headers } from "./headers";
import { Legend } from "./legend";
import { listFeatures } from "./utils";

// Note! Don't import any SCSS here inside *this* component.
// It's done in the component that lazy-loads this component.

// This string is used to prefill the body when clicking to file a new BCD
// issue over on github.com/mdn/browser-compat-data
const ISSUE_METADATA_TEMPLATE = `
<!-- Do not make changes below this line -->
<details>
<summary>MDN page report details</summary>

* Query: \`$QUERY_ID\`
* Report started: $DATE

</details>
`;

/**
 * Return a list of platforms and browsers that are relevant for this category &
 * data.
 *
 * If the category is "webextensions", only those are shown. In all other cases
 * at least the entirety of the "desktop" and "mobile" platforms are shown. If
 * the category is JavaScript, the entirety of the "server" category is also
 * shown. In all other categories, if compat data has info about Deno / Node.js
 * those are also shown. Deno is always shown if Node.js is shown.
 */
function gatherPlatformsAndBrowsers(
  category: string,
  data: bcd.Identifier
): [string[], bcd.BrowserNames[]] {
  const hasNodeJSData = data.__compat && "nodejs" in data.__compat.support;
  const hasDenoData = data.__compat && "deno" in data.__compat.support;

  let platforms = ["desktop", "mobile"];
  if (category === "javascript" || hasNodeJSData || hasDenoData) {
    platforms.push("server");
  }

  const browsers = new Set(
    Object.keys(browserData).filter(
      (browser) =>
        platforms.includes(browserData[browser].type) &&
        (category !== "webextensions" ||
          browserData[browser].accepts_webextensions)
    ) as bcd.BrowserNames[]
  );

  // If there is no Node.js data for a category outside of "javascript", don't
  // show it. It ended up in the browser list because there is data for Deno.
  if (category !== "javascript" && !hasNodeJSData) {
    browsers.delete("nodejs");
  }

  return [platforms, [...browsers]];
}

type CellIndex = [number, number];

function FeatureListAccordion({
  features,
  browsers,
}: {
  features: ReturnType<typeof listFeatures>;
  browsers: bcd.BrowserNames[];
}) {
  const [[activeRow, activeColumn], dispatchCellToggle] = useReducer<
    React.Reducer<CellIndex | [null, null], CellIndex>
  >(
    ([activeRow, activeColumn], [row, column]) =>
      activeRow === row && activeColumn === column
        ? [null, null]
        : [row, column],
    [null, null]
  );

  return (
    <>
      {features.map((feature, i) => (
        <FeatureRow
          key={i}
          {...{ feature, browsers }}
          index={i}
          activeCell={activeRow === i ? activeColumn : null}
          onToggleCell={([row, column]: [number, number]) => {
            dispatchCellToggle([row, column]);
          }}
        />
      ))}
    </>
  );
}

export default function BrowserCompatibilityTable({
  query,
  data,
  browsers: browserInfo,
}: {
  query: string;
  data: bcd.Identifier;
  browsers: bcd.Browsers;
}) {
  const location = useLocation();
  const { t } = useTranslation("bcd");

  if (!data || !Object.keys(data).length) {
    throw new Error(t("error.emptyData"));
  }

  const breadcrumbs = query.split(".");
  const category = breadcrumbs[0];
  const name = breadcrumbs[breadcrumbs.length - 1];

  const [platforms, browsers] = gatherPlatformsAndBrowsers(category, data);

  function getNewIssueURL() {
    const url = "https://github.com/mdn/browser-compat-data/issues/new";
    const sp = new URLSearchParams();
    const metadata = ISSUE_METADATA_TEMPLATE.replace(
      /\$DATE/g,
      new Date().toISOString()
    )
      .replace(/\$QUERY_ID/g, query)
      .trim();
    sp.set("mdn-url", `https://developer.mozilla.org${location.pathname}`);
    sp.set("metadata", metadata);
    sp.set("title", `${query} - <SUMMARIZE THE PROBLEM>`);
    sp.set("template", "data-problem.yml");
    return `${url}?${sp.toString()}`;
  }

  return (
    <BrowserCompatibilityErrorBoundary t={t}>
      <BrowserInfoContext.Provider value={browserInfo}>
        <a
          className="bc-github-link external external-icon"
          href={getNewIssueURL()}
          target="_blank"
          rel="noopener noreferrer"
          title={t("reportIssue.title")}
        >
          {t("reportIssue.body")}
        </a>
        <div className="table-scroll">
          <div className="table-scroll-inner">
            <table key="bc-table" className="bc-table bc-table-web">
              <Headers {...{ platforms, browsers }} />
              <tbody>
                <FeatureListAccordion
                  browsers={browsers}
                  features={listFeatures(data, "", name)}
                />
              </tbody>
            </table>
          </div>
        </div>
        <Legend compat={data} name={name} />

        {/* https://github.com/mdn/yari/issues/1191 */}
        <div className="hidden">
          <Trans t={t} i18nKey="attribution">
            The compatibility table on this page is generated from structured
            data. If you'd like to contribute to the data, please check out{" "}
            <a href="https://github.com/mdn/browser-compat-data">
              https://github.com/mdn/browser-compat-data
            </a>{" "}
            and send us a pull request.
          </Trans>
        </div>
      </BrowserInfoContext.Provider>
    </BrowserCompatibilityErrorBoundary>
  );
}
