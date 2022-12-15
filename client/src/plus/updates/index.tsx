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

export default function Updates() {
  document.title = `Updates | ${MDN_PLUS_TITLE}`;
  useScrollToTop();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page"), 10) || 0;
  const { data } = useUpdates(currentPage);

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
            Get the latest updates about browser compatibility of all the features in one place.
            {/* <br />
            <a rel="noreferrer noopener" target="_blank" href="TODO">
              We'd love to hear your feedback!
            </a> */}
          </p>
        </Container>
      </header>
      <Container>
        {data ? (
          <>
            {data.data.map((group) => (
              <GroupComponent
                key={group.browser + group.version}
                group={group}
              />
            ))}
            <Paginator current={currentPage} last={data.last} />
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
  return (
    <details
      className={`category-${category}`}
      onToggle={({ target }) =>
        target instanceof HTMLDetailsElement && setIsOpen(target.open)
      }
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
