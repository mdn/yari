import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./index.scss";

import "../icon-card/index.scss";

import { DataError, NotSignedIn } from "../common";
import {
  searchFiltersContext,
  SearchFiltersProvider,
} from "../contexts/search-filters";
import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";
import { useLocale } from "../../hooks";
import { BookmarkData } from "./types";
import { useUserData } from "../../user-context";
import { TabVariant, useCurrentTab } from "../notifications/tabs";
import { PlusTab } from "../common/plus-tab";
import { useCollectionsApiEndpoint } from "../notifications/api";
import { Loading } from "../../ui/atoms/loading";

dayjs.extend(relativeTime);

const COLLECTIONS_URL = "/plus/collection";
const FREQUENTLY_VIEWED_URL = "/plus/collection/frequently_viewed";

export const TAB_INFO = new Map([
  [
    TabVariant.COLLECTIONS,
    {
      label: "Collections",
      pageTitle: "Collections",
      path: COLLECTIONS_URL,
    },
  ],
  [
    TabVariant.FREQUENTLY_VIEWED,
    {
      label: "Frequently viewed articles",
      pageTitle: "Frequently viewed articles",
      path: FREQUENTLY_VIEWED_URL,
    },
  ],
]);

export default function Collections() {
  return (
    <SearchFiltersProvider>
      <CollectionsLayout />
    </SearchFiltersProvider>
  );
}

function CollectionsLayout() {
  const locale = useLocale();
  const userData = useUserData();

  const {
    selectedTerms,
    selectedFilter,
    selectedSort,
    setSelectedTerms,
    setSelectedFilter,
    setSelectedSort,
  } = useContext(searchFiltersContext);

  const currentTab = useCurrentTab(locale);

  const showTabs = userData && userData.isAuthenticated;
  const isAuthed = userData?.isAuthenticated;

  const [offset, setOffset] = useState(0);

  const { data, error, isLoading, hasMore, setEntries } =
    useCollectionsApiEndpoint(
      offset,
      selectedTerms,
      selectedFilter,
      selectedSort,
      currentTab
    );

  useEffect(() => {
    let unread;
    document.title = TAB_INFO.get(currentTab)?.pageTitle || "MDN Plus";
    if (data && data.items) {
      unread = data.items.filter((v) => v.read === false).length;
    }
    if (!!unread) {
      document.title = document.title + ` (${unread})`;
    }
  }, [data, currentTab]);

  useEffect(() => {
    setSelectedSort("");
    setSelectedTerms("");
    setSelectedFilter("");
    setOffset(0);
  }, [currentTab, setSelectedSort, setSelectedTerms, setSelectedFilter]);

  useEffect(() => {
    setOffset(0);
  }, [selectedTerms, selectedFilter, selectedSort]);

  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>Collections</h1>
        </Container>
        <Tabs
          tabs={[...TAB_INFO.values()].map((val) => {
            return { ...val, path: `/${locale}${val.path}` };
          })}
        />
      </header>
      {showTabs && (
        <Container>
          <>
            <PlusTab
              currentTab={currentTab}
              selectedTerms={selectedTerms}
              selectedFilter={selectedFilter}
              selectedSort={selectedSort}
              setOffset={setOffset}
              offset={offset}
              data={data}
              showSelectToolbar={false}
              hasMore={hasMore}
              setFrequentlyUsed={setEntries}
            />
          </>
          {isLoading && <Loading message="Waiting for data" />}
          {!userData && <Loading message="Waiting for authentication" />}
          {!userData && !isAuthed && <NotSignedIn />}
          {error && <DataError error={error} />}
        </Container>
      )}
    </>
  );
}

export type { BookmarkData };
