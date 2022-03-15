import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./index.scss";

import "../icon-card/index.scss";

import { NotSignedIn } from "../common";
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
import { PlusTabs } from "../common/plus-tabs";
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
  const isAuthed = userData?.isAuthenticated;

  const {
    selectedTerms,
    selectedFilter,
    selectedSort,
    setSelectedSort,
    setSelectedFilter,
    setSelectedTerms,
  } = useContext(searchFiltersContext);

  const currentTab = useCurrentTab(locale);
  useEffect(() => {
    setSelectedTerms("");
    setSelectedSort("");
    setSelectedFilter("");
  }, [currentTab, setSelectedTerms, setSelectedSort, setSelectedFilter]);
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
      <Container>
        <>
          <PlusTabs
            selectedTerms={selectedTerms}
            selectedFilter={selectedFilter}
            selectedSort={selectedSort}
            currentTab={currentTab}
          />
        </>
        {!userData && <Loading message="Waiting for authentication" />}
        {!userData && !isAuthed && <NotSignedIn />}
      </Container>
    </>
  );
}

export type { BookmarkData };
