import { html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { createRef, ref } from "lit/directives/ref.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import { getActiveLegendItems } from "./legend.js";
import {
  asList,
  bugURLToString,
  getCurrentSupport,
  hasMore,
  hasNoteworthyNotes,
  HIDDEN_BROWSERS,
  isFullySupportedWithoutLimitation,
  isNotSupportedAtAll,
  listFeatures,
  versionIsPreview,
} from "./utils.js";

import styles from "./index.scss?css" with { type: "css" };
import { DEFAULT_LOCALE } from "../../../../libs/constants/index.js";
import { BCD_TABLE } from "../../telemetry/constants.ts";
import {
  getSupportBrowserReleaseDate,
  getSupportClassName,
  labelFromString,
  versionLabelFromSupport,
} from "./feature-row.js";
import { GleanMixin } from "../glean-mixin.js";
import "../viewed-controller.js";
import { ViewedController } from "../viewed-controller.js";

/**
 * @import { TemplateResult } from "lit"
 * @import { BrowserName, BrowserStatement, SupportStatement, Browsers, Identifier, StatusBlock } from "@mdn/browser-compat-data/types"
 * @typedef {{ title: string, text: string, iconClassName: string }} StatusIcon
 */

const ISSUE_METADATA_TEMPLATE = `
<!-- Do not make changes below this line -->
<details>
<summary>MDN page report details</summary>

* Query: \`$QUERY_ID\`
* Report started: $DATE

</details>
`;

/**
 * @param {BrowserName} browser
 * @returns {string}
 */
function browserToIconName(browser) {
  if (browser.startsWith("firefox")) {
    return "simple-firefox";
  } else if (browser === "webview_android") {
    return "webview";
  } else if (browser === "webview_ios") {
    return "safari";
  } else {
    return browser.split("_")[0] ?? "";
  }
}

// Also specifies the order in which the legend
/**
 * @type {Record<string, string>}
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

class CompatTable extends GleanMixin(LitElement) {
  static properties = {
    query: {},
    locale: {},
    data: {},
    browserInfo: { attribute: "browserinfo" },
    _pathname: { state: true },
    _platforms: { state: true },
    _browsers: { state: true },
  };

  static styles = styles;

  _tableRef = createRef();

  constructor() {
    super();
    /** @type {ViewedController} */
    this.viewed = new ViewedController(this, this._tableRef, () =>
      this._gleanClick(`${BCD_TABLE}: view -> ${this.query}`)
    );
    this.query = "";
    /** @type {Identifier} */
    this.data = {};
    /** @type {Browsers} */
    // @ts-ignore
    this.browserInfo = {};
    this.locale = "";
    this._pathname = "";
    /** @type {string[]} */
    this._platforms = [];
    /** @type {BrowserName[]} */
    this._browsers = [];
  }

  get _breadcrumbs() {
    return this.query.split(".");
  }

  get _category() {
    return this._breadcrumbs[0] ?? "";
  }

  get _name() {
    return this._breadcrumbs.at(-1) ?? "";
  }

  connectedCallback() {
    super.connectedCallback();
    this._pathname = window.location.pathname;
    [this._platforms, this._browsers] = gatherPlatformsAndBrowsers(
      this._category,
      this.data,
      this.browserInfo
    );
  }

  get _issueUrl() {
    const url = "https://github.com/mdn/browser-compat-data/issues/new";
    const sp = new URLSearchParams();
    const metadata = ISSUE_METADATA_TEMPLATE.replace(
      /\$DATE/g,
      new Date().toISOString()
    )
      .replace(/\$QUERY_ID/g, this.query)
      .trim();
    sp.set("mdn-url", `https://developer.mozilla.org${this._pathname}`);
    sp.set("metadata", metadata);
    sp.set("title", `${this.query} - <SUMMARIZE THE PROBLEM>`);
    sp.set("template", "data-problem.yml");

    return `${url}?${sp.toString()}`;
  }

  _renderIssueLink() {
    const onClick = (/** @type {MouseEvent} */ event) => {
      event.preventDefault();
      window.open(this._issueUrl, "_blank", "noopener,noreferrer");
    };
    const source_file = this.data.__compat?.source_file;
    return html`<div class="bc-on-github">
      <a
        class="bc-github-link external external-icon"
        href="#"
        @click=${onClick}
        target="_blank"
        rel="noopener noreferrer"
        title="Report an issue with this compatibility data"
      >
        Report problems with this compatibility data</a
      >${source_file
        ? html` •
            <a
              class="bc-github-link external external-icon"
              href=${`https://github.com/mdn/browser-compat-data/tree/main/${source_file}`}
              target="_blank"
              rel="noopener noreferrer"
              title=${`File: ${source_file}`}
            >
              View data on GitHub
            </a>`
        : null}
    </div>`;
  }

  _renderTable() {
    return html`<figure class="table-container">
      <figure class="table-container-inner">
        ${this._renderIssueLink()}
        <table
          ${ref(this._tableRef)}
          class="bc-table bc-table-web"
          style="--browser-count: ${Object.keys(this._browsers).length}"
        >
          ${this._renderTableHeader()} ${this._renderTableBody()}
        </table>
      </figure>
    </figure>`;
  }

  _renderTableHeader() {
    return html`<thead>
      ${this._renderPlatformHeaders()} ${this._renderBrowserHeaders()}
    </thead>`;
  }

  _renderPlatformHeaders() {
    const platformsWithBrowsers = this._platforms.map((platform) => ({
      platform,
      browsers: this._browsers.filter(
        (browser) => this.browserInfo[browser].type === platform
      ),
    }));

    const grid = platformsWithBrowsers.map(({ browsers }) => browsers.length);
    return html`<tr class="bc-platforms">
      <td></td>
      ${platformsWithBrowsers.map(({ platform, browsers }, index) => {
        // Get the intersection of browsers in the `browsers` array and the
        // `PLATFORM_BROWSERS[platform]`.
        const browserCount = browsers.length;
        const cellClass = `bc-platform bc-platform-${platform}`;
        const iconClass = `icon icon-${platform}`;

        const columnStart =
          2 + grid.slice(0, index).reduce((acc, x) => acc + x, 0);
        const columnEnd = columnStart + browserCount;
        return html`<th
          class=${cellClass}
          colspan=${browserCount}
          title=${platform}
          style="grid-column: ${columnStart} / ${columnEnd}"
        >
          <span class=${iconClass}></span>
          <span class="visually-hidden">${platform}</span>
        </th>`;
      })}
    </tr>`;
  }

  _renderBrowserHeaders() {
    // <BrowserHeaders>
    return html`<tr class="bc-browsers">
      <td></td>
      ${this._browsers.map(
        (browser) =>
          html`<th class=${`bc-browser bc-browser-${browser}`}>
            <div class=${`bc-head-txt-label bc-head-icon-${browser}`}>
              ${this.browserInfo[browser]?.name}
            </div>
            <div
              class=${`bc-head-icon-symbol icon icon-${browserToIconName(
                browser
              )}`}
            ></div>
          </th>`
      )}
    </tr>`;
  }

  _renderTableBody() {
    // <FeatureListAccordion>
    const { data, _browsers: browsers, browserInfo, locale } = this;
    let features = listFeatures(data, "", this._name);

    const MAX_FEATURES = 100;

    // If there are too many features, hide nested features.
    if (features.length > MAX_FEATURES) {
      features = features.filter(({ depth }) => depth < 2);
    }

    // If there are still too many features, hide non-standard features.
    if (features.length > MAX_FEATURES) {
      features = features.filter(
        ({ compat: { status } }) => status?.standard_track
      );
    }

    // If there are still too many features, hide deprecated features.
    if (features.length > MAX_FEATURES) {
      features = features.filter(
        ({ compat: { status } }) => !status?.deprecated
      );
    }

    // If there are still too many features, hide experimental features.
    if (features.length > MAX_FEATURES) {
      features = features.filter(
        ({ compat: { status } }) => !status?.experimental
      );
    }

    // At this point, we did all we can to reduce the number of features shown.
    if (features.length > MAX_FEATURES) {
      features = features.slice(0, MAX_FEATURES);
    }

    return html`<tbody>
      ${features.map((feature) => {
        // <FeatureRow>
        const { name, compat, depth } = feature;

        const title = compat.description
          ? html`<span>${unsafeHTML(compat.description)}</span>`
          : html`<code>${name}</code>`;

        let titleNode;
        const titleContent = html`${title}${compat.status &&
        this._renderStatusIcons(compat.status)}`;
        if (compat.mdn_url && depth > 0) {
          const href = compat.mdn_url.replace(
            `/${DEFAULT_LOCALE}/docs`,
            `/${locale}/docs`
          );
          titleNode = html`<a
            href=${href}
            class="bc-table-row-header"
            data-glean=${`${BCD_TABLE}: link -> ${href}`}
          >
            ${titleContent}
          </a>`;
        } else {
          titleNode = html`<div class="bc-table-row-header">
            ${titleContent}
          </div>`;
        }

        const handleMousedown = (/** @type {MouseEvent} */ event) => {
          // Blur active element if already focused.
          const activeElement = this.shadowRoot?.activeElement;
          const { currentTarget } = event;

          if (
            activeElement instanceof HTMLElement &&
            currentTarget instanceof HTMLElement
          ) {
            const activeCell = activeElement.closest("td");
            const currentCell = currentTarget.closest("td");

            if (activeCell === currentCell) {
              activeElement.blur();
              event.preventDefault();
              return;
            }
          }

          if (currentTarget instanceof HTMLElement) {
            // Workaround for Safari, which doesn't focus implicitly.
            setTimeout(() => currentTarget.focus(), 0);
          }
        };

        return html`<tr>
          <th class=${`bc-feature bc-feature-depth-${depth}`} scope="row">
            ${titleNode}
          </th>
          ${browsers.map((browserName) => {
            // <CompatCell>
            const browser = browserInfo[browserName];
            const support = compat.support[browserName] ?? {
              version_added: null,
            };

            const supportClassName = getSupportClassName(support, browser);
            const notes = this._renderNotes(browser, support);

            return html`<td
              class=${`bc-support bc-browser-${browserName} bc-supports-${supportClassName} ${
                notes ? "bc-has-history" : ""
              }`}
            >
              <button
                type="button"
                title=${ifDefined(notes && "Toggle history")}
                @mousedown=${handleMousedown}
              >
                ${this._renderCellText(support, browser)}
              </button>
              ${notes &&
              html`<div class="timeline" tabindex="0">
                <dl class="bc-notes-list">${notes}</dl>
              </div>`}
            </td>`;
          })}
        </tr>`;
      })}
    </tbody>`;
  }

  /**
   * @param {SupportStatement} support
   */
  _renderCellIcons(support) {
    const supportItem = getCurrentSupport(support);
    if (!supportItem) {
      return null;
    }

    const icons = [
      supportItem.prefix && this._renderIcon("prefix"),
      hasNoteworthyNotes(supportItem) && this._renderIcon("footnote"),
      supportItem.alternative_name && this._renderIcon("altname"),
      supportItem.flags && this._renderIcon("disabled"),
      hasMore(support) && this._renderIcon("more"),
    ].filter(Boolean);

    return icons.length ? html`<div class="bc-icons">${icons}</div>` : null;
  }

  /**
   * @param {string} name
   * @returns {TemplateResult}
   */
  _renderIcon(name) {
    const title = name in LEGEND_LABELS ? LEGEND_LABELS[name] : name;

    return html`<abbr class="only-icon" title=${ifDefined(title)}>
      <span>${name}</span>
      <i class=${`icon icon-${name}`}></i>
    </abbr>`;
  }

  /**
   * @param {StatusBlock} status
   */
  _renderStatusIcons(status) {
    // <StatusIcons>
    /**
     * @type {StatusIcon[]}
     */
    const icons = [];
    if (status.experimental) {
      icons.push({
        title: "Experimental. Expect behavior to change in the future.",
        text: "Experimental",
        iconClassName: "icon-experimental",
      });
    }

    if (status.deprecated) {
      icons.push({
        title: "Deprecated. Not for use in new websites.",
        text: "Deprecated",
        iconClassName: "icon-deprecated",
      });
    }

    if (!status.standard_track) {
      icons.push({
        title: "Non-standard. Expect poor cross-browser support.",
        text: "Non-standard",
        iconClassName: "icon-nonstandard",
      });
    }

    return icons.length === 0
      ? null
      : html`<div class="bc-icons">
          ${icons.map(
            (icon) =>
              html`<abbr
                class=${`only-icon icon ${icon.iconClassName}`}
                title=${icon.title}
              >
                <span>${icon.text}</span>
              </abbr>`
          )}
        </div>`;
  }

  /**
   *
   * @param {BrowserStatement} browser
   * @param {SupportStatement} support
   */
  _renderNotes(browser, support) {
    return asList(support)
      .slice()
      .reverse()
      .flatMap((item, i) => {
        /**
         * @type {Array<{iconName: string; label: string | TemplateResult } | null>}
         */
        const supportNotes = [
          item.version_removed &&
          !asList(support).some(
            (otherItem) => otherItem.version_added === item.version_removed
          )
            ? {
                iconName: "footnote",
                label: `Removed in ${labelFromString(item.version_removed, browser)} and later`,
              }
            : null,
          item.partial_implementation
            ? {
                iconName: "footnote",
                label: "Partial support",
              }
            : null,
          item.prefix
            ? {
                iconName: "prefix",
                label: `Implemented with the vendor prefix: ${item.prefix}`,
              }
            : null,
          item.alternative_name
            ? {
                iconName: "altname",
                label: `Alternate name: ${item.alternative_name}`,
              }
            : null,
          item.flags
            ? {
                iconName: "disabled",
                label: (() => {
                  const hasAddedVersion =
                    typeof item.version_added === "string";
                  const hasRemovedVersion =
                    typeof item.version_removed === "string";
                  const flags = item.flags || [];
                  return html`
                    ${[
                      hasAddedVersion && `From version ${item.version_added}`,
                      hasRemovedVersion &&
                        `${hasAddedVersion ? " until" : "Until"} ${item.version_removed} (exclusive)`,
                      hasAddedVersion || hasRemovedVersion ? ": this" : "This",
                      " feature is behind the",
                      ...flags.map((flag, i) => {
                        const valueToSet = flag.value_to_set
                          ? html` (needs to be set to
                              <code>${flag.value_to_set}</code>)`
                          : "";

                        return [
                          html`<code>${flag.name}</code>`,
                          flag.type === "preference" &&
                            html` preference${valueToSet}`,
                          flag.type === "runtime_flag" &&
                            html` runtime flag${valueToSet}`,
                          i < flags.length - 1 && " and the ",
                        ].filter(Boolean);
                      }),
                      ".",
                      browser.pref_url &&
                        flags.some((flag) => flag.type === "preference") &&
                        ` To change preferences in ${browser.name}, visit ${browser.pref_url}.`,
                    ]
                      .filter(Boolean)
                      .map((value) => html`${value}`)}
                  `;
                })(),
              }
            : null,
          item.notes
            ? (Array.isArray(item.notes) ? item.notes : [item.notes]).map(
                (note) => ({ iconName: "footnote", label: note })
              )
            : null,
          item.impl_url
            ? (Array.isArray(item.impl_url)
                ? item.impl_url
                : [item.impl_url]
              ).map((impl_url) => ({
                iconName: "footnote",
                label: html`See
                  <a href=${impl_url}>${bugURLToString(impl_url)}</a>.`,
              }))
            : null,
          versionIsPreview(item.version_added, browser)
            ? {
                iconName: "footnote",
                label: "Preview browser support",
              }
            : null,
          // If we encounter nothing else than the required `version_added` and
          // `release_date` properties, assume full support.
          // EDIT 1-5-21: if item.version_added doesn't exist, assume no support.
          isFullySupportedWithoutLimitation(item) &&
          !versionIsPreview(item.version_added, browser)
            ? {
                iconName: "footnote",
                label: "Full support",
              }
            : isNotSupportedAtAll(item)
              ? {
                  iconName: "footnote",
                  label: "No support",
                }
              : null,
        ]
          .flat()
          .filter(Boolean);

        if (supportNotes.length === 0) {
          supportNotes.push({
            iconName: "unknown",
            label: "Support unknown",
          });
        }

        /**
         * @type {Array<{iconName: string; label: string | TemplateResult }>}
         */
        const filteredSupportNotes = supportNotes.filter((v) => v !== null);

        const hasNotes = supportNotes.length > 0;
        return (
          (i === 0 || hasNotes) &&
          html`<div class="bc-notes-wrapper">
            <dt
              class=${`bc-supports-${getSupportClassName(
                item,
                browser
              )} bc-supports`}
            >
              ${this._renderCellText(item, browser, true)}
            </dt>
            ${filteredSupportNotes.map(({ iconName, label }) => {
              return html`<dd class="bc-supports-dd">
                ${this._renderIcon(iconName)}${typeof label === "string"
                  ? html`<span>${unsafeHTML(label)}</span>`
                  : label}
              </dd>`;
            })}
            ${!hasNotes ? html`<dd></dd>` : null}
          </div>`
        );
      })
      .filter(Boolean);
  }

  /**
   *
   * @param {SupportStatement | undefined} support
   * @param {BrowserStatement} browser
   * @param {boolean} [timeline]
   */
  _renderCellText(support, browser, timeline = false) {
    const currentSupport = getCurrentSupport(support);

    const added = currentSupport?.version_added ?? null;
    const lastVersion = currentSupport?.version_last ?? null;

    const browserReleaseDate = getSupportBrowserReleaseDate(support);
    const supportClassName = getSupportClassName(support, browser);

    let status;
    switch (added) {
      case null:
        status = { isSupported: "unknown" };
        break;
      case true:
        status = { isSupported: lastVersion ? "no" : "yes" };
        break;
      case false:
        status = { isSupported: "no" };
        break;
      case "preview":
        status = { isSupported: "preview" };
        break;
      default:
        status = {
          isSupported: supportClassName,
          label: versionLabelFromSupport(added, lastVersion, browser),
        };
        break;
    }

    let label;
    let title = "";
    // eslint-disable-next-line default-case
    switch (status.isSupported) {
      case "yes":
        title = "Full support";
        label = status.label || "Yes";
        break;

      case "partial":
        title = "Partial support";
        label = status.label || "Partial";
        break;

      case "removed-partial":
        if (timeline) {
          title = "Partial support";
          label = status.label || "Partial";
        } else {
          title = "No support";
          label = status.label || "No";
        }
        break;

      case "no":
        title = "No support";
        label = status.label || "No";
        break;

      case "preview":
        title = "Preview support";
        label = status.label || browser.preview_name;
        break;

      case "unknown":
        title = "Support unknown";
        label = "?";
        break;
    }

    title = `${browser.name} – ${title}`;

    return html`<div
      class=${timeline
        ? "bcd-timeline-cell-text-wrapper"
        : "bcd-cell-text-wrapper"}
    >
      <div class="bcd-cell-icons">
        <span class="icon-wrap">
          <abbr
            class=${`
                bc-level-${supportClassName}
                icon
                icon-${supportClassName}`}
            title=${title}
          >
            <span class="bc-support-level">${title}</span>
          </abbr>
        </span>
      </div>
      <div class="bcd-cell-text-copy">
        <span class="bc-browser-name">${browser.name}</span>
        <span
          class="bc-version-label"
          title=${browserReleaseDate && !timeline
            ? `${browser.name} ${added} – Release date: ${browserReleaseDate}`
            : ""}
        >
          ${!timeline || added ? label : null}
          ${browserReleaseDate && timeline
            ? ` (Release date: ${browserReleaseDate})`
            : ""}
        </span>
      </div>
      ${support && this._renderCellIcons(support)}
    </div>`;
  }

  _renderTableLegend() {
    const { _browsers: browsers, browserInfo } = this;

    if (!browserInfo) {
      throw new Error("Missing browser info");
    }

    return html`<section class="bc-legend">
      <h3 class="visually-hidden" id="Legend">Legend</h3>
      <p class="bc-legend-tip">
        Tip: you can click/tap on a cell for more information.
      </p>
      <dl class="bc-legend-items-container">
        ${getActiveLegendItems(
          this.data,
          this._name,
          browserInfo,
          browsers
        ).map(([key, label]) =>
          ["yes", "partial", "no", "unknown", "preview"].includes(key)
            ? html`<div class="bc-legend-item">
                <dt class="bc-legend-item-dt">
                  <span class=${`bc-supports-${key} bc-supports`}>
                    <abbr
                      class=${`bc-level bc-level-${key} icon icon-${key}`}
                      title=${label}
                    >
                      <span class="visually-hidden">${label}</span>
                    </abbr>
                  </span>
                </dt>
                <dd class="bc-legend-item-dd">${label}</dd>
              </div>`
            : html`<div class="bc-legend-item">
                <dt class="bc-legend-item-dt">
                  <abbr
                    class="legend-icons icon icon-${key}"
                    title=${label}
                  ></abbr>
                </dt>
                <dd class="bc-legend-item-dd">${label}</dd>
              </div>`
        )}
      </dl>
    </section>`;
  }

  render() {
    return html` ${this._renderTable()} ${this._renderTableLegend()} `;
  }
}

customElements.define("compat-table", CompatTable);

/**
 * Return a list of platforms and browsers that are relevant for this category &
 * data.
 *
 * If the category is "webextensions", only those are shown. In all other cases
 * at least the entirety of the "desktop" and "mobile" platforms are shown. If
 * the category is JavaScript, the entirety of the "server" category is also
 * shown. In all other categories, if compat data has info about Deno / Node.js
 * those are also shown. Deno is always shown if Node.js is shown.
 *
 * @param {string} category
 * @param {Identifier} data
 * @param {Browsers} browserInfo
 * @returns {[string[], BrowserName[]]}
 */
export function gatherPlatformsAndBrowsers(category, data, browserInfo) {
  const hasNodeJSData = data.__compat && "nodejs" in data.__compat.support;
  const hasDenoData = data.__compat && "deno" in data.__compat.support;

  let platforms = ["desktop", "mobile"];
  if (category === "javascript" || hasNodeJSData || hasDenoData) {
    platforms.push("server");
  }

  /** @type BrowserName[] */
  let browsers = [];

  // Add browsers in platform order to align table cells
  for (const platform of platforms) {
    /**
     * @type {BrowserName[]}
     */
    // @ts-ignore
    const platformBrowsers = Object.keys(browserInfo);
    browsers.push(
      ...platformBrowsers.filter(
        (browser) =>
          browser in browserInfo && browserInfo[browser].type === platform
      )
    );
  }

  // Filter WebExtension browsers in corresponding tables.
  if (category === "webextensions") {
    browsers = browsers.filter(
      (browser) => browserInfo[browser].accepts_webextensions
    );
  }

  // If there is no Node.js data for a category outside "javascript", don't
  // show it. It ended up in the browser list because there is data for Deno.
  if (category !== "javascript" && !hasNodeJSData) {
    browsers = browsers.filter((browser) => browser !== "nodejs");
  }

  // Hide Internet Explorer compatibility data
  browsers = browsers.filter((browser) => !HIDDEN_BROWSERS.includes(browser));

  return [platforms, [...browsers]];
}
