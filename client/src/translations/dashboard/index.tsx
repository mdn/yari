import React from "react";
import {
  createSearchParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import useSWR from "swr";

import { MainContentContainer } from "../../ui/atoms/page-content";
import { Icon } from "../../ui/atoms/icon";
import { useLocale } from "../../hooks";

interface Data {
  l10nKPIs: L10nKPIs;
  sections: Section[];
  detailDocuments: DetailDocument[];
}

interface Section {
  l10nKPIs: L10nKPIs;
  name: string;
}

interface L10nKPIs {
  missing: number;
  outOfDate: number;
  upToDate: number;
  total: number;
}

interface DetailDocument {
  url: string;
  info: InfoDocument;
}

interface InfoDocument {
  popularity: DocumentPopularity;
  localePopularity: DocumentPopularity;
  defaultLocaleInfo: LocaleInfo;
  localeInfo?: LocaleInfo;
  dateDiff?: number;
}

interface DocumentPopularity {
  value: number;
  ranking: number;
  parentValue: number;
  parentRanking: number;
}

interface LocaleInfo {
  modified: string;
  commitURL: string;
}

interface LocaleStorageData {
  defaultSort?: string;
  defaultSortReverse?: string;
}

interface StorageData {
  [locale: string]: LocaleStorageData;
}

const LOCALSTORAGE_KEY = "translations-dashboard-sections";

function saveStorage(locale: string, data: LocaleStorageData) {
  try {
    const stored = JSON.parse(
      localStorage.getItem(LOCALSTORAGE_KEY) || "{}"
    ) as StorageData;
    stored[locale] = Object.assign({}, stored[locale] || {}, data);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.warn("Unable to save to localStorage", err);
  }
}

function getStorage(locale: string): LocaleStorageData | null {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || "{}");
    if (stored) {
      return stored[locale] as LocaleStorageData;
    }
  } catch (err) {
    console.warn("Unable to retrieve from localStorage", err);
  }
  return null;
}

export function TranslationDashboard() {
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [lastData, setLastData] = React.useState<Data | null>(null);

  const currentSection = searchParams.get("section") || "";
  React.useEffect(() => {
    if (locale.toLowerCase() === "en-us") {
      navigate(`/${locale}/_translations`);
    }
  }, [locale, navigate]);

  React.useEffect(() => {
    let title = "Translation dashboard ";
    if (locale.toLowerCase() !== "en-us") {
      title += ` for ${locale}`;
    }
    if (currentSection !== "") {
      title += ` - section ${currentSection}`;
    }
    document.title = title;
  }, [lastData, locale, currentSection]);

  let { data, error, isValidating } = useSWR<Data, Error>(
    locale.toLowerCase() !== "en-us"
      ? `/_translations/dashboard/?locale=${locale}&section=${currentSection}`
      : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} (${await response.text()})`);
      }
      if (
        !(response.headers.get("content-type") || "").includes(
          "application/json"
        )
      ) {
        throw new Error(
          `Response is not JSON (${response.headers.get("content-type")})`
        );
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
    }
  );

  React.useEffect(() => {
    if (data) {
      setLastData(data);
    }
  }, [data]);

  const lastStorageData = getStorage(locale);
  const defaultSort = lastStorageData?.defaultSort || "url";
  const defaultSortReverse = lastStorageData?.defaultSortReverse || "false";
  const sort = searchParams.get("sort") || defaultSort;
  const sortReverse = JSON.parse(
    searchParams.get("sortReverse") || defaultSortReverse
  );

  React.useEffect(() => {
    saveStorage(
      locale,
      Object.assign({}, lastStorageData, {
        defaultSort: sort,
        defaultSortReverse: sortReverse,
      })
    );
  }, [locale, sort, sortReverse, lastStorageData]);

  if (locale.toLowerCase() === "en-us") {
    return null;
  }

  let parentSection = "/";
  if (currentSection.split("/").length > 2) {
    const arrPathSection = currentSection.split("/");
    arrPathSection.pop();
    parentSection = arrPathSection.join("/");
  }

  return (
    <Container>
      {lastData && !error && isValidating && (
        <p style={{ float: "right" }}>Reloading...</p>
      )}
      {!data && !error && !lastData && <Loading />}
      {lastData && (
        <p style={{ textAlign: "right" }}>
          Go to{" "}
          <Link to={`/${locale}/_translations/differences`}>
            Translation differences for <b>{locale}</b>
          </Link>
          {" / "}
          <Link to={`/${locale}/_translations/missing`}>
            Missing translations for <b>{locale}</b>
          </Link>
        </p>
      )}
      {error && <ShowError error={error} />}
      {lastData && (
        <div>
          <SectionHeader
            l10nKPIs={lastData.l10nKPIs}
            section={currentSection}
            parentSection={parentSection}
          />
          <SubsectionTable
            sections={lastData.sections}
            currentSection={currentSection}
          />
          <DocumentsTable
            documents={lastData.detailDocuments}
            sort={sort}
            sortReverse={sortReverse}
            locale={locale}
          />
        </div>
      )}
    </Container>
  );
  /*
     );
    }
 */
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-section-translations">
      <MainContentContainer standalone={true}>{children}</MainContentContainer>
    </div>
  );
}

function ShowError({ error }) {
  return (
    <div className="error-message">
      <h3>Error</h3>
      <pre>{error.toString()}</pre>
    </div>
  );
}

function Loading() {
  return (
    <div>
      <label htmlFor="progress">Loading</label>
      <progress id="progress" max="100" style={{ margin: 20 }}></progress>
    </div>
  );
}

function SectionHeader({
  l10nKPIs,
  section,
  parentSection,
}: {
  l10nKPIs: L10nKPIs;
  section: string;
  parentSection: string;
}) {
  const completenessExact =
    (100 * (l10nKPIs.total - l10nKPIs.missing)) / l10nKPIs.total;
  const completenessStr = completenessExact.toFixed(1) + "%";
  const freshnessExact = (100 * l10nKPIs.upToDate) / l10nKPIs.total;
  const freshnessStr = freshnessExact.toFixed(1) + "%";
  return (
    <div className="documents">
      <h2>Localization dashboard for: {section || "/"}</h2>
      <p>
        Parent section:{" "}
        <a href={`dashboard?section=${parentSection}`}>{parentSection}</a>
      </p>
      <h3>Summary</h3>
      <dl>
        <dt>Total number of pages</dt>
        <dd>{l10nKPIs.total}</dd>
        <dt>Number of untranslated pages</dt>
        <dd>{l10nKPIs.missing}</dd>
        <dt>Number of outdated pages (older than English in Git) </dt>
        <dd>{l10nKPIs.outOfDate}</dd>
        <dt>Number of up-to-date pages</dt>
        <dd>{l10nKPIs.upToDate}</dd>
        <dt>
          <label htmlFor="completeness">Localization completeness</label>
        </dt>
        <dd>
          <progress id="completeness" max="100" value={completenessExact}>
            {completenessStr}
          </progress>{" "}
          {completenessStr}
        </dd>
        <dt>
          <label htmlFor="freshness">Localization freshness</label>
        </dt>
        <dd>
          <progress id="freshness" max="100" value={freshnessExact}>
            {freshnessStr}
          </progress>{" "}
          {freshnessStr}
        </dd>
      </dl>
    </div>
  );
}

function SubsectionTable({
  sections,
  currentSection,
}: {
  sections: Section[];
  currentSection: string;
}) {
  if (sections.length > 0) {
    return (
      <section id="subsection-table">
        <h3>Subsections</h3>
        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th>Total / Untranslated / Out of date</th>
              <th>Completeness</th>
              <th>Freshness</th>
            </tr>
          </thead>
          <tbody>
            {sections
              .sort(
                (sectionA, sectionB) =>
                  sectionB.l10nKPIs.total - sectionA.l10nKPIs.total
              )
              .map((section) => {
                const completenessExact =
                  (100 * (section.l10nKPIs.total - section.l10nKPIs.missing)) /
                  section.l10nKPIs.total;
                const completenessStr = completenessExact.toFixed(1) + "%";
                const freshnessExact =
                  (100 * section.l10nKPIs.upToDate) / section.l10nKPIs.total;
                const freshnessStr = freshnessExact.toFixed(1) + "%";
                const sectionHref =
                  "dashboard?section=%2F" + encodeURIComponent(section.name);
                return (
                  <tr key={section.name}>
                    <td>
                      <a href={sectionHref}>
                        {section.name
                          .replace(currentSection.slice(1), "")
                          .replace("/", "")}
                      </a>
                    </td>
                    <td>
                      {section.l10nKPIs.total} / {section.l10nKPIs.missing} /{" "}
                      {section.l10nKPIs.outOfDate}
                    </td>
                    <td>
                      <progress max="100" value={completenessExact}>
                        {completenessStr}
                      </progress>{" "}
                      {completenessStr}
                    </td>
                    <td>
                      <progress max="100" value={freshnessExact}>
                        {freshnessStr}
                      </progress>{" "}
                      {freshnessStr}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
    );
  } else {
    return null;
  }
}

function DocumentsTable({
  documents,
  sort,
  sortReverse,
  locale,
}: {
  documents: DetailDocument[];
  sort: string;
  sortReverse: boolean;
  locale: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = searchParams.get("section") || "";
  documents.map((documentDetail) => {
    if (documentDetail.info.localeInfo) {
      const dateLocale = new Date(documentDetail.info.localeInfo.modified);
      const dateDefaultLocale = new Date(
        documentDetail.info.defaultLocaleInfo.modified
      );
      const dateDiff = dateLocale.getTime() - dateDefaultLocale.getTime();
      documentDetail.info.dateDiff = dateDiff;
    } else {
      documentDetail.info.dateDiff = Number.POSITIVE_INFINITY;
    }
    return documentDetail;
  });

  function TableHead({
    id,
    title,
    sortable,
  }: {
    id: string;
    title: string;
    sortable?: boolean;
  }) {
    function getClassName() {
      const className = ["sortable"];

      if (sort === id) {
        className.push("active");
      }

      if (sortReverse) {
        className.push("reverse");
      }

      return className.join(" ");
    }

    function onClick() {
      if (sort === id) {
        setSearchParams(
          createSearchParams({
            sort: id,
            sortReverse: JSON.stringify(!sortReverse),
            section: currentSection,
          })
        );
      } else {
        setSearchParams(
          createSearchParams({ sort: id, section: currentSection })
        );
      }
    }

    return sortable ? (
      <th className={getClassName()} onClick={onClick}>
        {title} <Icon name="small-arrow" />
      </th>
    ) : (
      <th>{title}</th>
    );
  }

  return (
    <section id="documents-table">
      <h3>List of direct subpages</h3>

      <table>
        <thead>
          <tr>
            <TableHead id="url" title="Slug" sortable />
            <TableHead id="enMDNURL" title="English doc on MDN" />
            <TableHead
              id="enCommitGHURL"
              title="English doc commit on GitHub"
            />
            <TableHead id="localURL" title="Local localized doc" />
            <TableHead id="localMDNURL" title="Localized doc on MDN" />
            <TableHead
              id="localCommitGHURL"
              title="Localized doc commit on GitHub"
            />
            <TableHead
              id="popularityEn"
              title="Popularity rank (en-US)"
              sortable
            />
            <TableHead
              id="popularityLocale"
              title={`Popularity rank (${locale})`}
              sortable
            />
            <TableHead id="dateDiff" title="Date delta" sortable />
          </tr>
        </thead>

        <tbody>
          {documents
            .sort((A, B) => {
              let reverse = sortReverse ? -1 : 1;
              if (sort === "dateDiff") {
                const a = A.info.dateDiff || Number.POSITIVE_INFINITY;
                const b = B.info.dateDiff || Number.POSITIVE_INFINITY;
                return reverse * (b - a);
              } else if (sort === "popularityLocale") {
                const a =
                  A.info.localePopularity?.ranking || Number.POSITIVE_INFINITY;
                const b =
                  B.info.localePopularity?.ranking || Number.POSITIVE_INFINITY;
                return reverse * (a - b);
              } else if (sort === "popularityEn") {
                const a = A.info.popularity.ranking || Number.POSITIVE_INFINITY;
                const b = B.info.popularity.ranking || Number.POSITIVE_INFINITY;
                return reverse * (a - b);
              } else if (sort === "url") {
                const a = A.url;
                const b = B.url;
                return reverse * a.localeCompare(b);
              } else {
                throw new Error(`Unrecognized sort '${sort}'`);
              }
            })
            .map((documentDetail) => {
              const url = "https://developer.mozilla.org" + documentDetail.url;
              const englishCommitHash =
                documentDetail.info.defaultLocaleInfo.commitURL
                  .split("commit/")[1]
                  .substring(0, 7);
              const localeCommitHash = documentDetail.info.localeInfo?.commitURL
                .split("commit/")[1]
                .substring(0, 7);
              let status = "Untranslated";
              if (documentDetail.info.localeInfo) {
                let dateDiff =
                  documentDetail.info.dateDiff ?? Number.POSITIVE_INFINITY;
                status = "Out of date";

                if (dateDiff > 0) {
                  status = "Fresher than English";
                } else if (dateDiff > -2678400000) {
                  const nbDays = Math.round(-dateDiff / (3600 * 24 * 1000));
                  status = nbDays + " day" + (nbDays > 1 ? "s" : "");
                } else {
                  const nbMonths = Math.round(
                    -dateDiff / (3600 * 24 * 1000 * 30)
                  );
                  status = nbMonths + " month" + (nbMonths > 1 ? "s" : "");
                }
              }
              return (
                <tr key={documentDetail.url}>
                  <td>
                    <a href={documentDetail.url}>{documentDetail.url}</a>
                  </td>
                  <td>
                    <a href={url}>English current MDN page</a>
                  </td>
                  <td>
                    <a href={documentDetail.info.defaultLocaleInfo.commitURL}>
                      GitHub link for <code>{englishCommitHash}</code>
                    </a>
                  </td>
                  <td>
                    {documentDetail.info.localeInfo && (
                      <a
                        href={documentDetail.url.replace(
                          "/en-US/",
                          "/" + locale + "/"
                        )}
                      >
                        Local {locale} page
                      </a>
                    )}
                  </td>
                  <td>
                    {documentDetail.info.localeInfo && (
                      <a href={url.replace("/en-US/", "/" + locale + "/")}>
                        Locale current MDN page
                      </a>
                    )}
                  </td>
                  <td>
                    {documentDetail.info.localeInfo && (
                      <a href={documentDetail.info.localeInfo.commitURL}>
                        GitHub link for <code>{localeCommitHash}</code>
                      </a>
                    )}
                  </td>
                  <td>{documentDetail.info.popularity.ranking}</td>
                  <td>
                    {documentDetail.info.localePopularity &&
                      documentDetail.info.localePopularity.ranking}
                  </td>
                  <td>{status}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </section>
  );
}
