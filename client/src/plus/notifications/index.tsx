import { useContext, useEffect } from "react";
import { useLocale } from "../../hooks";
import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";

import {
  searchFiltersContext,
  SearchFiltersProvider,
} from "../contexts/search-filters";
import "./index.scss";

import { useUserData } from "../../user-context";
import { TabVariant, TAB_INFO, useCurrentTab } from "../common/tabs";
import { NotSignedIn } from "../common";
import { NotificationsTab, StarredNotificationsTab } from "./notifications-tab";
import { WatchedTab } from "./watched-items-tab";

function NotificationsLayout() {
  const locale = useLocale();
  const userData = useUserData();

  const { selectedTerms, selectedFilter, selectedSort, clearSearchFilters } =
    useContext(searchFiltersContext);

  const currentTab = useCurrentTab(locale);

  useEffect(() => {
    clearSearchFilters();
  }, [currentTab, clearSearchFilters]);

  const showTabs = userData && userData.isAuthenticated;
  const isAuthed = userData?.isAuthenticated;

  const tabsForRoute = [
    TAB_INFO[TabVariant.NOTIFICATIONS],
    TAB_INFO[TabVariant.STARRED],
    TAB_INFO[TabVariant.WATCHING],
  ].map((val) => {
    return { ...val, path: `/${locale}${val?.path}` };
  });

  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>Notifications</h1>
        </Container>
        <Tabs tabs={tabsForRoute} />
      </header>
      {showTabs && (
        <Container>
          {currentTab === TabVariant.NOTIFICATIONS && (
            <NotificationsTab
              selectedTerms={selectedTerms}
              selectedSort={selectedSort}
              selectedFilter={selectedFilter}
            />
          )}
          {currentTab === TabVariant.STARRED && (
            <StarredNotificationsTab
              selectedTerms={selectedTerms}
              selectedSort={selectedSort}
              selectedFilter={selectedFilter}
            />
          )}
          {currentTab === TabVariant.WATCHING && (
            <WatchedTab
              selectedTerms={selectedTerms}
              selectedSort={selectedSort}
              selectedFilter={selectedFilter}
            />
          )}
        </Container>
      )}
      {!userData && !isAuthed && <NotSignedIn />}
    </>
  );
}

export default function Notifications() {
  return (
    <SearchFiltersProvider>
      <NotificationsLayout />
    </SearchFiltersProvider>
  );
}
