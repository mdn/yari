import { useContext, useEffect } from "react";
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
import { mutate } from "swr";
import { HEADER_NOTIFICATIONS_MENU_API_URL } from "../../constants";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

function NotificationsLayout() {
  const locale = useLocale();
  const location = useLocation();

  const { selectedTerms, getSearchFiltersParams } =
    useContext(searchFiltersContext);

  const starredUrl = `/${locale}/plus/notifications/starred`;
  const watchingUrl = `/${locale}/plus/notifications/watching`;

  let pageTitle = "My Notifications";
  let apiUrl = `/api/v1/plus/notifications/?${getSearchFiltersParams().toString()}`;

  if (location.pathname === starredUrl) {
    apiUrl += "&filterStarred=true";
    pageTitle = "My Starred Pages";
  }
  useEffect(() => {
    const clearNotificationsUrl =
      "/api/v1/plus/notifications/all/mark-as-read/";
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", getCookie("csrftoken") || "");

    // if the user clicks a hard link, we set notifications as read using a sendBeacon request
    const markNotificationsAsRead = () => {
      if (document.visibilityState === "hidden") {
        navigator.sendBeacon(clearNotificationsUrl, formData);
      }
    };
    document.addEventListener("visibilitychange", markNotificationsAsRead);

    return () => {
      // if the user clicks a react-router Link, we remove the sendBeacon handler
      // and send a fetch request to mark notifications as read
      document.removeEventListener("visibilitychange", markNotificationsAsRead);
      fetch(clearNotificationsUrl, {
        body: formData,
        method: "POST",
      }).then(async () => {
        await mutate(apiUrl);
        await mutate(HEADER_NOTIFICATIONS_MENU_API_URL);
      });
    };
  }, [apiUrl]);

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
      label: "Watch List",
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
              pageTitle="My Watched Pages"
            />
          </>
        ) : (
          <>
            <SearchFilter filters={filters} sorts={sorts} />
            <List
              component={NotificationCard}
              apiUrl={apiUrl}
              makeKey={(item) => item.id}
              pageTitle={pageTitle}
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
