import { useContext, useEffect } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs'. Did you mean to set th... Remove this comment to see the full error message
import dayjs from "dayjs";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs/plugin/relativeTime'. Di... Remove this comment to see the full error message
import relativeTime from "dayjs/plugin/relativeTime";
import "./index.scss";

import "../icon-card/index.scss";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../common'. Did you mean to se... Remove this comment to see the full error message
import { NotSignedIn } from "../common";
import {
  searchFiltersContext,
  SearchFiltersProvider,
} from "../contexts/search-filters";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/atoms/container'. Did... Remove this comment to see the full error message
import Container from "../../ui/atoms/container";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/tabs'. Did ... Remove this comment to see the full error message
import Tabs from "../../ui/molecules/tabs";
import { useLocale } from "../../hooks";
import { BookmarkData } from "./types";
import { useUserData } from "../../user-context";
import { TabVariant, TAB_INFO, useCurrentTab } from "../common/tabs";
import { PlusTabs } from "../common/plus-tabs";
import { MDN_PLUS_TITLE } from "../../constants";

dayjs.extend(relativeTime);

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
  const showTabs = userData && userData.isAuthenticated;

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

  useEffect(() => {
    document.title = TAB_INFO[currentTab].pageTitle || MDN_PLUS_TITLE;

    return () => {
      document.title = MDN_PLUS_TITLE;
    };
  }, [currentTab]);

  const tabsForRoute = [
    TAB_INFO[TabVariant.COLLECTIONS],
    TAB_INFO[TabVariant.FREQUENTLY_VIEWED],
  ].map((val) => {
    return { ...val, path: `/${locale}${val?.path}` };
  });

  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>Collections</h1>
        </Container>
        <Tabs tabs={tabsForRoute} />
      </header>
      {showTabs && (
        <Container>
          <>
            <PlusTabs
              selectedTerms={selectedTerms}
              selectedFilter={selectedFilter}
              selectedSort={selectedSort}
              currentTab={currentTab}
            />
          </>
        </Container>
      )}
      {!userData && !isAuthed && <NotSignedIn />}
    </>
  );
}

export type { BookmarkData };
