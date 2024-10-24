import React, { useReducer, useRef } from "react";
import { useLocation } from "react-router-dom";
import type BCD from "@mdn/browser-compat-data/types";
import { BrowserInfoContext } from "./browser-info";
import { BrowserCompatibilityErrorBoundary } from "./error-boundary";
import {
  FeatureRow,
  getCurrentSupportAttributes,
  getCurrentSupportType,
} from "./feature-row";
import { Headers } from "./headers";
import { Legend } from "./legend";
import { listFeatures } from "./utils";
import { useViewed } from "../../../hooks";
import { BCD_TABLE } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";

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

export const HIDDEN_BROWSERS = ["ie"];

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
  data: BCD.Identifier,
  browserInfo: BCD.Browsers
): [string[], BCD.BrowserName[]] {
  const hasNodeJSData = data.__compat && "nodejs" in data.__compat.support;
  const hasDenoData = data.__compat && "deno" in data.__compat.support;

  let platforms = ["desktop", "mobile"];
  if (category === "javascript" || hasNodeJSData || hasDenoData) {
    platforms.push("server");
  }

  let browsers: BCD.BrowserName[] = [];

  // Add browsers in platform order to align table cells
  for (const platform of platforms) {
    browsers.push(
      ...(Object.keys(browserInfo).filter(
        (browser) => browserInfo[browser].type === platform
      ) as BCD.BrowserName[])
    );
  }

  // Filter WebExtension browsers in corresponding tables.
  if (category === "webextensions") {
    browsers = browsers.filter(
      (browser) => browserInfo[browser].accepts_webextensions
    );
  }

  // If there is no Node.js data for a category outside of "javascript", don't
  // show it. It ended up in the browser list because there is data for Deno.
  if (category !== "javascript" && !hasNodeJSData) {
    browsers = browsers.filter((browser) => browser !== "nodejs");
  }

  // Hide Internet Explorer compatibility data
  browsers = browsers.filter((browser) => !HIDDEN_BROWSERS.includes(browser));

  return [platforms, [...browsers]];
}

type CellIndex = [number, number];

function FeatureListAccordion({
  features,
  browsers,
  browserInfo,
  locale,
  query,
}: {
  features: ReturnType<typeof listFeatures>;
  browsers: BCD.BrowserName[];
  browserInfo: BCD.Browsers;
  locale: string;
  query: string;
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

  const gleanClick = useGleanClick();
  const clickedCells = useRef(new Set<string>());

  return (
    <>
      {features.map((feature, i) => (
        <FeatureRow
          key={i}
          {...{ feature, browsers }}
          index={i}
          activeCell={activeRow === i ? activeColumn : null}
          onToggleCell={([row, column]: [number, number]) => {
            const cell = `${column}:${row}`;
            if (!clickedCells.current.has(cell)) {
              clickedCells.current.add(cell);
              const feature = features[row];
              const browser = browsers[column];
              const support = feature.compat.support[browser];
              const supportType = getCurrentSupportType(
                support,
                browserInfo[browser]
              );
              const supportAttributes = getCurrentSupportAttributes(support);
              const attrs = Object.entries({ ...supportAttributes })
                .filter(([, value]) => value)
                .map(([key]) => key);
              gleanClick(
                `${BCD_TABLE}: click ${browser} ${query} -> ${feature.name} = ${supportType} [${attrs.join(",")}]`
              );
            }
            dispatchCellToggle([row, column]);
          }}
          locale={locale}
        />
      ))}
    </>
  );
}

export default function BrowserCompatibilityTable({
  query,
  data,
  browsers: browserInfo,
  locale,
}: {
  query: string;
  data: BCD.Identifier;
  browsers: BCD.Browsers;
  locale: string;
}) {
  const location = useLocation();
  const gleanClick = useGleanClick();

  const observedNode = useViewed(() => {
    gleanClick(`${BCD_TABLE}: view`);
  });

  if (!data || !Object.keys(data).length) {
    throw new Error(
      "BrowserCompatibilityTable component called with empty data"
    );
  }

  const breadcrumbs = query.split(".");
  const category = breadcrumbs[0];
  const name = breadcrumbs[breadcrumbs.length - 1];

  const [platforms, browsers] = gatherPlatformsAndBrowsers(
    category,
    data,
    browserInfo
  );

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
    <BrowserCompatibilityErrorBoundary>
      <BrowserInfoContext.Provider value={browserInfo}>
        <a
          className="bc-github-link external external-icon"
          href={getNewIssueURL()}
          target="_blank"
          rel="noopener noreferrer"
          title="Report an issue with this compatibility data"
        >
          Report problems with this compatibility data on GitHub
        </a>
        <figure className="table-container">
          <figure className="table-container-inner">
            <table
              key="bc-table"
              className="bc-table bc-table-web"
              ref={observedNode}
            >
              <Headers
                platforms={platforms}
                browsers={browsers}
                browserInfo={browserInfo}
              />
              <tbody>
                <FeatureListAccordion
                  browsers={browsers}
                  browserInfo={browserInfo}
                  features={listFeatures(data, "", name)}
                  locale={locale}
                  query={query}
                />
              </tbody>
            </table>
          </figure>
        </figure>
        <Legend compat={data} name={name} />

        {/* https://github.com/mdn/yari/issues/1191 */}
        <div className="hidden">
          The compatibility table on this page is generated from structured
          data. If you'd like to contribute to the data, please check out{" "}
          <a href="https://github.com/mdn/browser-compat-data">
            https://github.com/mdn/browser-compat-data
          </a>{" "}
          and send us a pull request.
        </div>
      </BrowserInfoContext.Provider>
    </BrowserCompatibilityErrorBoundary>
  );
}
