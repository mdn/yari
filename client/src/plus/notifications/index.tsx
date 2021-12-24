import { useContext } from "react";
import { useLocale } from "../../hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import {
  searchFiltersContext,
  SearchFiltersProvider,
} from "../contexts/search-filters";

import { Button } from "../../ui/atoms/button";
import Container from "../../ui/atoms/container";
import List from "../common/list";
import SearchFilter from "../search-filter";
import Tabs from "../../ui/molecules/tabs";

import "./index.scss";

dayjs.extend(relativeTime);

function NotificationCard(item) {
  /*
  function toggleStar() {
    const localApiURL = `/api/v1/plus/notifications/${item.id}/star`;
  }

  function deleteNotification() {
    const localApiURL = `/api/v1/plus/notifications/${item.id}/delete`;
  }
  */

  return (
    <article className={`notification-card ${!item.read ? "unread" : ""}`}>
      <Button
        type="action"
        extraClasses="notification-card-star"
        icon={item.starred ? "star-filled" : "star"}
        onClickHandler={toggleStar}
      >
        <span className="sr-only">Toggle Starring</span>
      </Button>

      <div className="notification-card-description">
        <h2 className="notification-card-title">{item.title}</h2>
        <p className="notification-card-text">{item.text}</p>
      </div>

      <time
        className="notification-card-created"
        dateTime={dayjs(item.created).toISOString()}
      >
        {dayjs(item.created).fromNow().toString()}
      </time>

      <Button type="action" icon="trash" onClickHandler={deleteNotification}>
        <span className="sr-only">Delete</span>
      </Button>
    </article>
  );
}

function NotificationsLayout() {
  const locale = useLocale();

  const { selectedTerms, selectedFilter, selectedSort } =
    useContext(searchFiltersContext);

  const listUrl = `/api/v1/plus/notifications/?${selectedTerms}&${selectedFilter}&${selectedSort}`;

  const tabs = [
    {
      label: "All Notifications",
      path: `/${locale}/plus/notifications/`,
    },
    {
      label: "Starred",
      path: `/${locale}/plus/notifications/starred`,
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
        <SearchFilter filters={filters} sorts={sorts} />
        <List component={NotificationCard} apiUrl={listUrl} />
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
