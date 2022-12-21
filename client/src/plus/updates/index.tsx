import Container from "../../ui/atoms/container";

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { DocMetadata } from "../../../../libs/types/document";
import { MDN_PLUS_TITLE } from "../../constants";
import BrowserCompatibilityTable from "../../document/ingredients/browser-compatibility-table";
import { browserToIconName } from "../../document/ingredients/browser-compatibility-table/headers";
import { useLocale, useScrollToTop } from "../../hooks";
import { Button } from "../../ui/atoms/button";
import { Icon } from "../../ui/atoms/icon";
import { Loading } from "../../ui/atoms/loading";
import Mandala from "../../ui/molecules/mandala";
import { Paginator } from "../../ui/molecules/paginator";
import BookmarkMenu from "../../ui/organisms/article-actions/bookmark-menu";
import { NotificationsWatchMenu } from "../../ui/organisms/article-actions/notifications-watch-menu";
import { useUserData } from "../../user-context";
import { camelWrap, range } from "../../utils";
import { Event, Group, useBCD, useUpdates } from "./api";
import "./index.scss";
import { useGleanClick } from "../../telemetry/glean-context";
import { PLUS_UPDATES } from "../../telemetry/constants";
import SearchFilter, { AnyFilter, AnySort } from "../search-filter";
import { SearchFiltersProvider } from "../contexts/search-filters";
import { LoginBanner } from "./login-banner";

const CATEGORY_TO_NAME = {
  api: "Web APIs",
  css: "CSS",
  html: "HTML",
  http: "HTTP",
  javascript: "JavaScript",
  mathml: "MathML",
  svg: "SVG",
  webdriver: "WebDriver",
  webextensions: "Web Extensions",
};

const BROWSERS = {
  chrome: "Chrome",
  chrome_android: "Chrome Android",
  deno: "Deno",
  edge: "Edge",
  firefox: "Firefox",
  firefox_android: "Firefox for Android",
  ie: "Internet Explorer",
  nodejs: "Node.js",
  opera: "Opera",
  opera_android: "Opera Android",
  safari: "Safari",
  safari_ios: "Safari on iOS",
  samsunginternet_android: "Samsung Internet",
  webview_android: "WebView Android",
};

const FILTERS: AnyFilter[] = [
  {
    type: "select",
    multiple: {
      encode: (...values: string[]) => values.join(","),
      decode: (value: string) => value.split(","),
    },
    label: "Browsers",
    key: "browsers",
    options: Object.entries(BROWSERS).map(([value, label]) => ({
      label,
      value,
    })),
  },
  {
    type: "select",
    multiple: {
      encode: (...values: string[]) => values.join(","),
      decode: (value: string) => value.split(","),
    },
    label: "Category",
    key: "category",
    options: Object.entries(CATEGORY_TO_NAME)
      .sort(([, a], [, b]) => a.localeCompare(b))
      .map(([value, label]) => ({
        label,
        value,
      })),
  },
  {
    type: "select",
    label: "Show",
    key: "show",
    options: [
      {
        label: "All pages",
        value: "all",
        isDefault: true,
      },
      {
        label: "Pages I'm watching",
        value: "watched",
      },
    ],
  },
];

const SORTS: AnySort[] = [
  {
    label: "Newest",
    param: "sort=desc",
    isDefault: true,
  },
  {
    label: "Oldest",
    param: "sort=asc",
  },
];

export default function Updates() {
  return (
    <SearchFiltersProvider>
      <UpdatesLayout />
    </SearchFiltersProvider>
  );
}

function UpdatesLayout() {
  document.title = `Updates | ${MDN_PLUS_TITLE}`;
  useScrollToTop();
  const user = useUserData();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page"), 10) || 1;
  const { data } = useUpdates(currentPage);
  const gleanClick = useGleanClick();

  const canFilter = user?.isAuthenticated === true;

  return (
    <div className="updates">
      <header className="plus-header-mandala">
        <Container>
          <h1>
            <div className="mandala-icon-wrapper">
              <Mandala rotate={true} />
              <Icon name="bell-filled" />
            </div>
            <span>Updates</span>
          </h1>
          <p>
            Get the latest updates about browser compatibility of all the
            features.
            <br />
            <a
              href="https://survey.alchemer.com/s3/7149796/MDN-BCD-Updates"
              target="_blank"
              rel="noreferrer noopener"
              className="external"
            >
              We'd love to hear your feedback!
            </a>
          </p>
        </Container>
      </header>
      <Container>
        <SearchFilter filters={FILTERS} sorts={SORTS} isDisabled={!canFilter} />

        {user && !user.isAuthenticated && <LoginBanner />}

        {data ? (
          <>
            {data.data.map((group) => (
              <GroupComponent
                key={group.browser + group.version}
                group={group}
              />
            ))}
            <Paginator
              current={currentPage}
              last={data.last}
              onChange={(page, oldPage) =>
                gleanClick(`${PLUS_UPDATES.PAGE_CHANGE}: ${oldPage} -> ${page}`)
              }
            />
          </>
        ) : (
          <Loading />
        )}
      </Container>
    </div>
  );
}

function GroupComponent({ group }: { group: Group }) {
  const { release_date, events, browser, version, name } = group;
  const length = events.added.length + events.removed.length;
  const metadata = {
    icon: browserToIconName(browser),
    title: `${name} ${version}`,
  };
  // {
  //   icon: "star",
  //   title: "Subfeatures added",
  // }
  // {
  //   icon: "add",
  //   title: "Added missing compatibility data",
  // }

  return metadata ? (
    <div className="group">
      <header>
        <Icon name={metadata.icon} />
        {metadata.title}
        <span className="number-badge">
          {length} {length === 1 ? "update" : "updates"}
        </span>
        <time dateTime={release_date}>
          {new Date(release_date).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
        </time>
      </header>
      {collapseEvents(events.added).map((event) => (
        <EventComponent key={event.path} event={event} status={"added"} />
      ))}
      {collapseEvents(events.removed).map((event) => (
        <EventComponent key={event.path} event={event} status={"removed"} />
      ))}
    </div>
  ) : null;
}

function collapseEvents(events: Event[]): Event[] {
  return events.filter(
    (event) =>
      events.findIndex(
        (e) => e.path === event.path.split(".").slice(0, -1).join(".")
      ) === -1
  );
}

function EventComponent({ event, status }: { event: Event; status: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, ...displayPath] = event.path.split(".");
  const engines = event.compat.engines;
  const gleanClick = useGleanClick();

  return (
    <details
      className={`category-${category}`}
      onToggle={({ target }) => {
        if (target instanceof HTMLDetailsElement) {
          setIsOpen(target.open);
          const source = target.open
            ? PLUS_UPDATES.EVENT_EXPAND
            : PLUS_UPDATES.EVENT_COLLAPSE;
          gleanClick(source);
        }
      }}
    >
      <summary>
        <code>{camelWrap(displayPath.join("."))}</code>
        <i>{CATEGORY_TO_NAME[category]}</i>
        {status}
        {Boolean(engines.length) && (
          <span className="status" title={`Supported in ${engines.join(", ")}`}>
            <svg width="32" height="9" viewBox="0 0 32 9" role="img">
              {range(0, 3).map((n) => (
                <circle
                  key={n}
                  cx={4 + n * 12}
                  cy="4.5"
                  r="4"
                  className={engines.length > n ? "active" : undefined}
                />
              ))}
            </svg>
          </span>
        )}
        <Icon name="chevron" />
      </summary>
      {isOpen && <EventInnerComponent event={event} />}
    </details>
  );
}

function EventInnerComponent({
  event: {
    path,
    compat: { mdn_url },
  },
}: {
  event: Event;
}) {
  const locale = useLocale();
  const { data } = useBCD(path);
  return (
    <div>
      <ArticleActions path={path} mdn_url={mdn_url} />
      {data && (
        <BrowserCompatibilityTable
          query={path}
          data={data.data}
          browsers={data.browsers}
          locale={locale}
        />
      )}
    </div>
  );
}

function ArticleActions({ path, mdn_url }: { path: string; mdn_url?: string }) {
  const userData = useUserData();
  const locale = useLocale();
  const url = mdn_url?.replace("https://developer.mozilla.org", `/${locale}`);
  const searchUrl = `/${locale}/search?sort=relevance&locale=en-US${
    locale !== "en-US" ? `&locale=${locale}` : ""
  }&q=${encodeURIComponent(path)}`;
  const { data: doc } = useSWR<DocMetadata>(
    () => userData?.isAuthenticated && url && `${url}/metadata.json`,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw Error(response.statusText);
      }

      return (await response.json()) as DocMetadata;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return (
    <nav>
      <Button
        type="action"
        icon={url ? "external" : "search"}
        size="small"
        href={url || searchUrl}
        target="_blank"
        extraClasses="link-button"
      >
        {url ? "See full article" : "Search for article"}
      </Button>
      {url && (
        <>
          <NotificationsWatchMenu doc={doc} />
          <BookmarkMenu doc={doc} />
        </>
      )}
    </nav>
  );
}
