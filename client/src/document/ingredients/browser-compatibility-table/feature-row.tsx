import React, { useContext } from "react";
import type BCD from "@mdn/browser-compat-data/types";
import { BrowserInfoContext } from "./browser-info";
import {
  asList,
  getCurrentSupport,
  hasMore,
  hasNoteworthyNotes,
  isFullySupportedWithoutLimitation,
  isNotSupportedAtAll,
  isTruthy,
  versionIsPreview,
  SupportStatementExtended,
  bugURLToString,
} from "./utils";
import { LEGEND_LABELS } from "./legend";
import { DEFAULT_LOCALE } from "../../../../../libs/constants";
import { BCD_TABLE } from "../../../telemetry/constants";

function getSupportClassName(
  support: SupportStatementExtended | undefined,
  browser: BCD.BrowserStatement
): "no" | "yes" | "partial" | "preview" | "removed-partial" | "unknown" {
  if (!support) {
    return "unknown";
  }

  let { flags, version_added, version_removed, partial_implementation } =
    getCurrentSupport(support)!;

  let className;
  if (version_added === null) {
    className = "unknown";
  } else if (versionIsPreview(version_added, browser)) {
    className = "preview";
  } else if (version_added) {
    className = "yes";
    if (version_removed || (flags && flags.length)) {
      className = "no";
    }
  } else {
    className = "no";
  }
  if (partial_implementation) {
    className = version_removed ? "removed-partial" : "partial";
  }

  return className;
}

function StatusIcons({ status }: { status: BCD.StatusBlock }) {
  const icons = [
    status.experimental && {
      title: "Experimental. Expect behavior to change in the future.",
      text: "Experimental",
      iconClassName: "icon-experimental",
    },
    status.deprecated && {
      title: "Deprecated. Not for use in new websites.",
      text: "Deprecated",
      iconClassName: "icon-deprecated",
    },
    !status.standard_track && {
      title: "Non-standard. Expect poor cross-browser support.",
      text: "Non-standard",
      iconClassName: "icon-nonstandard",
    },
  ].filter(isTruthy);
  return icons.length === 0 ? null : (
    <div className="bc-icons" data-test={icons.length}>
      {icons.map((icon) => (
        <abbr
          key={icon.iconClassName}
          className={`only-icon icon ${icon.iconClassName}`}
          title={icon.title}
        >
          <span>{icon.text}</span>
        </abbr>
      ))}
    </div>
  );
}

function labelFromString(
  version: string | boolean | null | undefined,
  browser: BCD.BrowserStatement
) {
  if (typeof version !== "string") {
    return <>{"?"}</>;
  }
  // Treat BCD ranges as exact versions to avoid confusion for the reader
  // See https://github.com/mdn/yari/issues/3238
  if (version.startsWith("≤")) {
    return <>{version.slice(1)}</>;
  }
  if (version === "preview") {
    return browser.preview_name;
  }
  return <>{version}</>;
}

function versionLabelFromSupport(
  added: string | boolean | null | undefined,
  removed: string | boolean | null | undefined,
  browser: BCD.BrowserStatement
) {
  if (typeof removed !== "string") {
    return <>{labelFromString(added, browser)}</>;
  }
  return (
    <>
      {labelFromString(added, browser)}&#8202;&ndash;&#8202;
      {labelFromString(removed, browser)}
    </>
  );
}

const CellText = React.memo(
  ({
    support,
    browser,
    timeline = false,
  }: {
    support: BCD.SupportStatement | undefined;
    browser: BCD.BrowserStatement;
    timeline?: boolean;
  }) => {
    const currentSupport = getCurrentSupport(support);

    const added = currentSupport?.version_added ?? null;
    const lastVersion = currentSupport?.version_last ?? null;

    const browserReleaseDate = currentSupport?.release_date;
    const supportClassName = getSupportClassName(support, browser);

    let status:
      | { isSupported: "unknown" }
      | {
          isSupported: "no" | "yes" | "partial" | "preview" | "removed-partial";
          label?: React.ReactNode;
        };
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

    let label: string | React.ReactNode;
    let title = "";
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

    return (
      <div
        className={
          timeline ? "bcd-timeline-cell-text-wrapper" : "bcd-cell-text-wrapper"
        }
      >
        <div className="bcd-cell-icons">
          <span className="icon-wrap">
            <abbr
              className={`
              bc-level-${supportClassName}
              icon
              icon-${supportClassName}`}
              title={title}
            >
              <span className="bc-support-level">{title}</span>
            </abbr>
          </span>
        </div>
        <div className="bcd-cell-text-copy">
          <span className="bc-browser-name">{browser.name}</span>
          <span
            className="bc-version-label"
            title={
              browserReleaseDate && !timeline
                ? `${browser.name} ${added} – Released ${browserReleaseDate}`
                : undefined
            }
          >
            {label}
            {browserReleaseDate && timeline
              ? ` (Released ${browserReleaseDate})`
              : ""}
          </span>
        </div>
        <CellIcons support={support} />
      </div>
    );
  }
);

function Icon({ name }: { name: string }) {
  const title = LEGEND_LABELS[name] ?? name;

  return (
    <abbr className="only-icon" title={title}>
      <span>{name}</span>
      <i className={`icon icon-${name}`} />
    </abbr>
  );
}

function CellIcons({ support }: { support: BCD.SupportStatement | undefined }) {
  const supportItem = getCurrentSupport(support);
  if (!supportItem) {
    return null;
  }

  const icons = [
    supportItem.prefix && <Icon key="prefix" name="prefix" />,
    hasNoteworthyNotes(supportItem) && <Icon key="footnote" name="footnote" />,
    supportItem.alternative_name && <Icon key="altname" name="altname" />,
    supportItem.flags && <Icon key="disabled" name="disabled" />,
    hasMore(support) && <Icon key="more" name="more" />,
  ].filter(Boolean);

  return icons.length ? <div className="bc-icons">{icons}</div> : null;
}

function FlagsNote({
  supportItem,
  browser,
}: {
  supportItem: BCD.SimpleSupportStatement;
  browser: BCD.BrowserStatement;
}) {
  const hasAddedVersion = typeof supportItem.version_added === "string";
  const hasRemovedVersion = typeof supportItem.version_removed === "string";
  const flags = supportItem.flags || [];
  return (
    <>
      {hasAddedVersion && `From version ${supportItem.version_added}`}
      {hasRemovedVersion && (
        <>
          {hasAddedVersion ? " until" : "Until"} version{" "}
          {supportItem.version_removed} (exclusive)
        </>
      )}
      {hasAddedVersion || hasRemovedVersion ? ": this" : "This"} feature is
      behind the{" "}
      {flags.map((flag, i) => {
        const valueToSet = flag.value_to_set && (
          <>
            {" "}
            (needs to be set to <code>{flag.value_to_set}</code>)
          </>
        );
        return (
          <React.Fragment key={flag.name}>
            <code>{flag.name}</code>
            {flag.type === "preference" && <> preference{valueToSet}</>}
            {flag.type === "runtime_flag" && <> runtime flag{valueToSet}</>}
            {i < flags.length - 1 && " and the "}
          </React.Fragment>
        );
      })}
      .
      {browser.pref_url &&
        flags.some((flag) => flag.type === "preference") &&
        ` To change preferences in ${browser.name}, visit ${browser.pref_url}.`}
    </>
  );
}

function getNotes(
  browser: BCD.BrowserStatement,
  support: BCD.SupportStatement
) {
  if (support) {
    return asList(support)
      .slice()
      .reverse()
      .flatMap((item, i) => {
        const supportNotes = [
          item.version_removed &&
          !asList(support).some(
            (otherItem) => otherItem.version_added === item.version_removed
          )
            ? {
                iconName: "footnote",
                label: (
                  <>
                    Removed in {labelFromString(item.version_removed, browser)}{" "}
                    and later
                  </>
                ),
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
                label: <FlagsNote browser={browser} supportItem={item} />,
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
                label: (
                  <>
                    See <a href={impl_url}>{bugURLToString(impl_url)}</a>.
                  </>
                ),
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
          .filter(isTruthy);

        const hasNotes = supportNotes.length > 0;
        return (
          (i === 0 || hasNotes) && (
            <React.Fragment key={i}>
              <div className="bc-notes-wrapper">
                <dt
                  className={`bc-supports-${getSupportClassName(
                    item,
                    browser
                  )} bc-supports`}
                >
                  <CellText support={item} browser={browser} timeline={true} />
                </dt>
                {supportNotes.map(({ iconName, label }, i) => {
                  return (
                    <dd className="bc-supports-dd" key={i}>
                      <Icon name={iconName} />{" "}
                      {typeof label === "string" ? (
                        <span dangerouslySetInnerHTML={{ __html: label }} />
                      ) : (
                        label
                      )}
                    </dd>
                  );
                })}
                {!hasNotes && <dd />}
              </div>
            </React.Fragment>
          )
        );
      })
      .filter(isTruthy);
  }
}

function CompatCell({
  browserId,
  browserInfo,
  support,
  showNotes,
  onToggle,
  locale,
}: {
  browserId: BCD.BrowserName;
  browserInfo: BCD.BrowserStatement;
  support: BCD.SupportStatement | undefined;
  showNotes: boolean;
  onToggle: () => void;
  locale: string;
}) {
  const supportClassName = getSupportClassName(support, browserInfo);
  // NOTE: 1-5-21, I've forced hasNotes to return true, in order to
  // make the details view open all the time.
  // Whenever the support statement is complex (array with more than one entry)
  // or if a single entry is complex (prefix, notes, etc.),
  // we need to render support details in `bc-history`
  // const hasNotes =
  //   support &&
  //   (asList(support).length > 1 ||
  //     asList(support).some(
  //       (item) =>
  //         item.prefix || item.notes || item.alternative_name || item.flags
  //     ));
  const notes = getNotes(browserInfo, support!);
  const content = (
    <>
      <CellText {...{ support }} browser={browserInfo} />
      {showNotes && (
        <dl className="bc-notes-list bc-history bc-history-mobile">{notes}</dl>
      )}
    </>
  );

  return (
    <>
      <td
        className={`bc-support bc-browser-${browserId} bc-supports-${supportClassName} ${
          notes ? "bc-has-history" : ""
        }`}
        aria-expanded={showNotes ? "true" : "false"}
        onClick={notes ? () => onToggle() : undefined}
      >
        <button type="button" disabled={!notes} title="Toggle history">
          {content}
          <span className="offscreen">Toggle history</span>
        </button>
      </td>
    </>
  );
}

export const FeatureRow = React.memo(
  ({
    index,
    feature,
    browsers,
    activeCell,
    onToggleCell,
    locale,
  }: {
    index: number;
    feature: {
      name: string;
      compat: BCD.CompatStatement;
      depth: number;
    };
    browsers: BCD.BrowserName[];
    activeCell: number | null;
    onToggleCell: ([row, column]: [number, number]) => void;
    locale: string;
  }) => {
    const browserInfo = useContext(BrowserInfoContext);

    if (!browserInfo) {
      throw new Error("Missing browser info");
    }

    const { name, compat, depth } = feature;
    const title = compat.description ? (
      <span dangerouslySetInnerHTML={{ __html: compat.description }} />
    ) : (
      <code>{name}</code>
    );
    const activeBrowser = activeCell !== null ? browsers[activeCell] : null;

    let titleNode: string | React.ReactNode;

    if (compat.mdn_url && depth > 0) {
      const href = compat.mdn_url.replace(
        `/${DEFAULT_LOCALE}/docs`,
        `/${locale}/docs`
      );
      titleNode = (
        <a
          href={href}
          className="bc-table-row-header"
          data-glean={`${BCD_TABLE}: link -> ${href}`}
        >
          {title}
          {compat.status && <StatusIcons status={compat.status} />}
        </a>
      );
    } else {
      titleNode = (
        <div className="bc-table-row-header">
          {title}
          {compat.status && <StatusIcons status={compat.status} />}
        </div>
      );
    }

    return (
      <>
        <tr>
          <th className={`bc-feature bc-feature-depth-${depth}`} scope="row">
            {titleNode}
          </th>
          {browsers.map((browser, i) => (
            <CompatCell
              key={browser}
              browserId={browser}
              browserInfo={browserInfo[browser]}
              support={compat.support[browser]}
              showNotes={activeCell === i}
              onToggle={() => onToggleCell([index, i])}
              locale={locale}
            />
          ))}
        </tr>
        {activeBrowser && (
          <tr className="bc-history bc-history-desktop">
            <td colSpan={browsers.length + 1}>
              <dl className="bc-notes-list">
                {getNotes(
                  browserInfo[activeBrowser],
                  compat.support[activeBrowser]!
                )}
              </dl>
            </td>
          </tr>
        )}
      </>
    );
  }
);
