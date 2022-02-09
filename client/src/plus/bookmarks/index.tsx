import React, { useContext } from "react";
import useSWR, { mutate } from "swr";
import {
  createSearchParams,
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Button } from "../../ui/atoms/button";

import { DISABLE_AUTH } from "../../constants";
import { AuthDisabled } from "../../ui/atoms/auth-disabled";
import { Loading } from "../../ui/atoms/loading";
import { useUserData } from "../../user-context";

import "./index.scss";

// TODO: Consider refactoring the plus/icon-card component to accept
// this data in addition to the watch list data.
import "../icon-card/index.scss";

import { DataError, NotSignedIn, NotSubscriber } from "../common";
import NoteCard from "../../ui/molecules/notecards";
import { getBookmarkApiUrl } from "../../ui/molecules/bookmark/menu";
import {
  searchFiltersContext,
  SearchFiltersProvider,
} from "../contexts/search-filters";
import SearchFilter from "../search-filter";
import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";
import { useLocale } from "../../hooks";
import { useFrequentlyViewed } from "../../document/hooks";
import { BookmarkData, BookmarksData, Breadcrumb, TABS } from "./types";
import { EditBookmark } from "../../ui/molecules/bookmark/edit-bookmark";
import { DropdownMenuWrapper, DropdownMenu } from "../../ui/molecules/dropdown";
import { docCategory } from "../../utils";
import { useUIStatus } from "../../ui-context";
import { post } from "../notifications/utils";
import { FrequentlyViewedEntry } from "../../document/types";

dayjs.extend(relativeTime);

function transformTitle(title) {
  const transformStrings = {
    "Web technology for developers": "References",
    "Learn web development": "Guides",
    "HTML: HyperText Markup Language": "HTML",
    "CSS: Cascading Style Sheets": "CSS",
    "Graphics on the Web": "Graphi;cs",
    "HTML elements reference": "Elements",
    "JavaScript reference": "JavaScript",
    "Structuring the web with HTML": "HTML",
    "Learn to style HTML using CSS": "CSS",
    "Web forms — Working with user data": "Forms",
  };
  return transformStrings[title] || title;
}

const filters = [
  // {
  //   label: "Content Updates",
  //   param: "filterType=content",
  // },
  // {
  //   label: "Browser Compatibility",
  //   param: "filterType=compat",
  // },
];

const localeToTab = (locale) => [
  {
    label: "Collection",
    path: `/${locale}/plus/collection`,
  },
  {
    label: "Frequently visited articles",
    path: `/${locale}/plus/collection/frequently-visited`,
  },
];

const sorts = [
  {
    label: "Date",
    param: "",
  },
  {
    label: "Title",
    param: "sort=title",
  },
];

export default function Bookmarks() {
  return (
    <SearchFiltersProvider>
      <BookmarksLayout />
    </SearchFiltersProvider>
  );
}

function BookmarksLayout() {
  const userData = useUserData();
  const locale = useLocale();
  const location = useLocation();

  const SELECTED_TAB =
    location.pathname === `/${locale}/plus/collection/frequently-visited`
      ? TABS.TAB_FREQ_VISITED
      : TABS.TAB_BOOKMARKS;

  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedTerms, getSearchFiltersParams } =
    useContext(searchFiltersContext);
  const { setToastData } = useUIStatus();

  const pageTitle = "My Collection";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);

  const isSubscriber = userData && userData.isSubscriber;

  const apiParams = getSearchFiltersParams();
  const page = searchParams.get("page");
  if (page) {
    apiParams.append("page", page);
  }
  const apiURL = isSubscriber ? getBookmarkApiUrl(apiParams) : null;

  let [entries, setEntries] = useFrequentlyViewed();

  const bookmarkData: BookmarksData = mapToBookmarksData(
    entries,
    selectedTerms
  );

  const deleteFrequentlyViewed = async (
    bookmarkData: BookmarkData,
    undelete: boolean | undefined
  ) => {
    if (undelete) {
      const restored: FrequentlyViewedEntry = {
        url: bookmarkData.url,
        title: bookmarkData.title,
        timestamp: new Date(bookmarkData.created).getTime(),
        parents: bookmarkData.parents,
        visitCount: bookmarkData.visitCount || 1,
      };
      setEntries([restored, ...entries]);
    } else {
      setEntries(entries.filter((entry) => entry.url !== bookmarkData.url));
    }
    return true;
  };

  const {
    data,
    error,
    isValidating,
    mutate: listMutate,
  } = useBookmarkData(apiURL);

  React.useEffect(() => {
    if (data && data.metadata.total > 0) {
      let newTitle = `${pageTitle} (${data.metadata.total})`;
      if (data.metadata.page > 1) {
        newTitle += ` Page ${data.metadata.page}`;
      }
      document.title = newTitle;
    }
  }, [data]);

  React.useEffect(() => {
    if (data) {
      // If you're on ?page=3 and the per_page number is 10 and you have
      // 31 bookmarks. If you delete the only bookmark there on page 3,
      // it no longer makes sense to be on that page. So we force a
      // change to `?page={3 - 1}`.
      if (data.metadata.page > 1 && data.items.length === 0) {
        const newSearchParams = createSearchParams(searchParams);
        if (data.metadata.page === 2) {
          newSearchParams.delete("page");
        } else {
          newSearchParams.set("page", `${data.metadata.page - 1}`);
        }
        setSearchParams(newSearchParams);
      }
    }
  }, [data, setSearchParams, searchParams]);

  async function deleteBookmarked(bookmark: BookmarkData, undelete?: boolean) {
    if (!data) return false;
    const apiPostURL = getBookmarkApiUrl(
      new URLSearchParams([["url", bookmark.url]])
    );
    const response = await fetch(apiPostURL, {
      method: "POST",
      body: new URLSearchParams(undelete ? undefined : { delete: "true" }),
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status} on ${response.url}`);
    }
    listMutate();
    mutate(apiPostURL);
    setToastData({
      mainText: `${bookmark.title} removed from your collection`,
      shortText: "Article removed",
      buttonText: "UNDO",
      buttonHandler: async () => {
        await post(apiPostURL, data.csrfmiddlewaretoken);
        await listMutate();
        setToastData(null);
      },
    });
    return true;
  }

  if (DISABLE_AUTH) {
    return <AuthDisabled />;
  }

  if (!userData) {
    return <Loading message="Waiting for authentication" />;
  } else if (!userData.isAuthenticated) {
    return <NotSignedIn />;
  } else if (!userData.isSubscriber) {
    return <NotSubscriber />;
  }

  if (error) {
    return <DataError error={error} />;
  }
  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>My Collection</h1>
        </Container>
      </header>
      <Tabs tabs={localeToTab(locale)} />
      <Container>
        {SELECTED_TAB === TABS.TAB_BOOKMARKS &&
          (data ? (
            <>
              <SearchFilter filters={filters} sorts={sorts} />
              <DisplayData
                data={data}
                isValidating={isValidating}
                listMutate={listMutate}
                deleteBookmarked={deleteBookmarked}
                showEditButton={true}
              />
            </>
          ) : (
            <Loading message="Waiting for data" />
          ))}
        {SELECTED_TAB === TABS.TAB_FREQ_VISITED && (
          <>
            <SearchFilter filters={filters} />
            <DisplayData
              data={bookmarkData}
              isValidating={false}
              listMutate={listMutate}
              deleteBookmarked={deleteFrequentlyViewed}
              showEditButton={false}
            />
          </>
        )}
      </Container>
    </>
  );
}

function mapToBookmarksData(
  entries: FrequentlyViewedEntry[],
  selectedTerms: string
) {
  const items: BookmarkData[] = entries
    .map((entry, idx) => {
      return {
        id: idx,
        url: entry.url,
        title: entry.title,
        notes: "",
        parents: entry.parents,
        created: new Date(entry.timestamp).toISOString(),
        visitCount: entry.visitCount,
      } as BookmarkData;
    })
    .filter((result) =>
      result.title.toLowerCase().includes(selectedTerms.toLowerCase())
    );

  const bookmarkData: BookmarksData = {
    items: items,
    metadata: {
      page: 1,
      per_page: 20,
      total: items.length,
    },
    csrfmiddlewaretoken: "",
  };
  return bookmarkData;
}

function useBookmarkData(apiURL: string | null) {
  return useSWR<BookmarksData, Error>(apiURL, async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} on ${response.url}`);
    }
    return (await response.json()) as BookmarksData;
  });
}

function DisplayData({
  data,
  isValidating,
  listMutate,
  deleteBookmarked,
  showEditButton,
}: {
  data: BookmarksData;
  isValidating: boolean;
  listMutate: CallableFunction;
  deleteBookmarked: (
    bookmark: BookmarkData,
    undelete?: boolean
  ) => Promise<boolean>;
  showEditButton: boolean;
}) {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [toggleError, setToggleError] = React.useState<Error | null>(null);

  const maxPage = Math.ceil(data.metadata.total / data.metadata.per_page);
  const nextPage =
    data.metadata.page + 1 <= maxPage ? data.metadata.page + 1 : 0;
  const previousPage = data.metadata.page - 1 > 0 ? data.metadata.page - 1 : 0;

  function getPaginationURL(page: number) {
    const sp = createSearchParams(searchParams);
    if (page === 1) {
      sp.delete("page");
    } else {
      sp.set("page", `${page}`);
    }
    if (sp.toString()) {
      return `${pathname}?${sp.toString()}`;
    }
    return pathname;
  }

  return (
    <>
      {data.metadata.total === 0 && (
        <p className="nothing-bookmarked">
          Nothing saved yet. Go out there and explore!
        </p>
      )}

      {toggleError && (
        <NoteCard type="negative">
          <h3>Server error</h3>
          <p>Unable to save your bookmark to the server.</p>
          <p>
            <code>{toggleError.toString()}</code>
          </p>
          <a href={window.location.pathname}>Reload this page and try again.</a>
        </NoteCard>
      )}

      {unbookmarked && (
        <div className="unbookmark">
          <p>
            Bookmark removed{" "}
            <Button
              type="action"
              onClickHandler={async () => {
                try {
                  await deleteBookmarked(unbookmarked, true);
                  setUnbookmarked(null);
                  if (toggleError) {
                    setToggleError(null);
                  }
                } catch (err: any) {
                  setToggleError(err);
                }
              }}
            >
              Undo
            </Button>
          </p>
        </div>
      )}

      <section className="icon-card-list">
        {data.items.map((bookmark) => {
          return (
            <Bookmark
              key={bookmark.url}
              isValidating={isValidating}
              listMutate={listMutate}
              data={data}
              bookmark={bookmark}
              showEditButton={showEditButton}
              toggle={async () => {
                try {
                  await deleteBookmarked(bookmark);
                  setUnbookmarked(bookmark);
                  if (toggleError) {
                    setToggleError(null);
                  }
                } catch (err: any) {
                  setToggleError(err);
                }
              }}
            />
          );
        })}
      </section>
      {(nextPage !== 0 || previousPage !== 0) && (
        <div className="pagination">
          {previousPage !== 0 && (
            <Link to={getPaginationURL(previousPage)}>Page {previousPage}</Link>
          )}{" "}
          {nextPage !== 0 && (
            <Link to={getPaginationURL(nextPage)}>Page {nextPage}</Link>
          )}
        </div>
      )}
    </>
  );
}

function _getIconLabel(url) {
  let category = docCategory({ pathname: url });

  if (category) {
    category = category?.split("-")[1];

    if (category === "javascript") {
      return "js";
    }

    if (category === "accessibility") {
      return "acc";
    }
    return category;
  }

  return "docs";
}

function Bookmark({
  bookmark,
  data,
  showEditButton,
  isValidating,
  listMutate,
  toggle,
}: {
  bookmark: BookmarkData;
  data: BookmarksData;
  isValidating: boolean;
  showEditButton: boolean;
  listMutate: CallableFunction;
  toggle: () => Promise<void>;
}) {
  const [show, setShow] = React.useState(false);
  const [doomed, setDoomed] = React.useState(false);

  let className = "icon-card";
  if (doomed) {
    className += " doomed";
  }
  const iconClass = docCategory({ pathname: bookmark.url })?.split("-")[1];
  const iconLabel = _getIconLabel(bookmark.url);

  return (
    <div key={bookmark.id} className={className}>
      <div className="icon-card-title-wrap">
        <div className={`icon-card-icon ${iconClass || ""}`}>{iconLabel}</div>
        <div className="icon-card-content">
          {bookmark.parents.length > 0 && (
            <Breadcrumbs parents={bookmark.parents} />
          )}
          <h2 className="icon-card-title">
            <a href={bookmark.url}>{bookmark.title}</a>
          </h2>
        </div>
        <DropdownMenuWrapper
          className="dropdown is-flush-right"
          isOpen={show}
          setIsOpen={(value, event) => {
            if (
              !document.querySelector(".modal-content")?.contains(event.target)
            ) {
              setShow(value);
            }
          }}
        >
          <Button
            type="action"
            icon="ellipses"
            ariaControls="bookmark-dropdown"
            ariaHasPopup={"menu"}
            ariaExpanded={show || undefined}
            onClickHandler={() => {
              setShow(!show);
            }}
          />
          <DropdownMenu>
            <ul className="dropdown-list" id="bookmark-dropdown">
              <li className="dropdown-item">
                <EditBookmark
                  doc={null}
                  isValidating={isValidating}
                  data={{
                    bookmarked: bookmark,
                    csrfmiddlewaretoken: data.csrfmiddlewaretoken,
                  }}
                  mutate={listMutate}
                />
              </li>
              <li className="dropdown-item">
                <Button
                  type="action"
                  title="Delete"
                  onClickHandler={async () => {
                    setDoomed(true);
                    try {
                      await toggle();
                    } catch (error) {
                      setDoomed(false);
                    }
                  }}
                >
                  Delete
                </Button>
              </li>
              {showEditButton && (
                <li className="dropdown-item">
                  <EditBookmark
                    doc={null}
                    isValidating={isValidating}
                    data={{
                      bookmarked: bookmark,
                      csrfmiddlewaretoken: data.csrfmiddlewaretoken,
                    }}
                    mutate={listMutate}
                  />
                </li>
              )}
            </ul>
          </DropdownMenu>
        </DropdownMenuWrapper>
      </div>
      {bookmark.notes && (
        <p className="icon-card-description">{bookmark.notes}</p>
      )}
    </div>
  );
}

function Breadcrumbs({ parents }: { parents: Breadcrumb[] }) {
  return (
    <ol className="breadcrumbs">
      {parents.map((parent, i) => {
        return (
          <li
            key={parent.uri}
            className={i + 1 === parents.length ? "last" : undefined}
          >
            <a href={parent.uri}>{transformTitle(parent.title)}</a>
          </li>
        );
      })}
    </ol>
  );
}

export type { BookmarkData };
