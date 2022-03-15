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
import { TAB_INFO, useCurrentTab } from "./tabs";
import { PlusTabs } from "../common/plus-tabs";

function NotificationsLayout() {
  const locale = useLocale();
  const userData = useUserData();

  const {
    selectedTerms,
    selectedFilter,
    selectedSort,
    setSelectedTerms,
    setSelectedSort,
    setSelectedFilter,
  } = useContext(searchFiltersContext);

  const currentTab = useCurrentTab(locale);

  useEffect(() => {
    setSelectedTerms("");
    setSelectedSort("");
    setSelectedFilter("");
  }, [currentTab, setSelectedTerms, setSelectedSort, setSelectedFilter]);

  const showTabs = userData && userData.isAuthenticated;
  const isAuthed = userData?.isAuthenticated;

  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>Notifications</h1>
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
            <PlusTabs
              currentTab={currentTab}
              selectedTerms={selectedTerms}
              selectedFilter={selectedFilter}
              selectedSort={selectedSort}
            />
          </>
        </Container>
      )}
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
