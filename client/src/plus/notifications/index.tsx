import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../../hooks";
import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";
import List from "../common/list";
import {
  searchFiltersContext,
  SearchFiltersProvider,
} from "../contexts/search-filters";
import SearchFilter from "../search-filter";
import "./index.scss";
import NotificationCard from "./notification-card";
import WatchCard from "./watch-card";

function NotificationsLayout() {
  const locale = useLocale();
  const location = useLocation();

  const { selectedTerms, getSearchFiltersParams } =
    useContext(searchFiltersContext);

  const starredUrl = `/${locale}/plus/notifications/starred`;
  const watchingUrl = `/${locale}/plus/notifications/watching`;

  let apiUrl = `/api/v1/plus/notifications/?${getSearchFiltersParams().toString()}`;
  if (location.pathname === starredUrl) {
    apiUrl += "&filterStarred=true";
  }
  let watchingApiUrl = `/api/v1/plus/watched/?q=${encodeURIComponent(
    selectedTerms
  )}`;

  const watching = location.pathname === watchingUrl;

  const tabs = [
    {
      label: "All Notifications",
      path: `/${locale}/plus/notifications`,
    },
    {
      label: "Starred",
      path: starredUrl,
    },
    {
      label: "Watching",
      path: watchingUrl,
    },
  ];

  const filters = [
    {
      label: "Content Updates",
      param: "filterType=content",
    },
    {
      label: "Browser Compatibility",
      param: "filterType=compat",
    },
  ];

  const sorts = [
    {
      label: "Date",
      param: "sort=date",
    },
    {
      label: "Title",
      param: "sort=title",
    },
  ];

  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>My Notifications</h1>
        </Container>
        <Tabs tabs={tabs} />
      </header>

      <Container>
        {watching ? (
          <>
            <SearchFilter />
            <List
              component={WatchCard}
              apiUrl={watchingApiUrl}
              makeKey={(item) => item.url}
            />
          </>
        ) : (
          <>
            <SearchFilter filters={filters} sorts={sorts} />
            <List
              component={NotificationCard}
              apiUrl={apiUrl}
              makeKey={(item) => item.id}
            />
          </>
        )}
      </Container>
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
