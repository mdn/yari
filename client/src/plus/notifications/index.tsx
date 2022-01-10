import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../../hooks";
import { Button } from "../../ui/atoms/button";
import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";
import List from "../common/list";
import {
  searchFiltersContext,
  SearchFiltersProvider,
} from "../contexts/search-filters";
import SearchFilter from "../search-filter";
import "./index.scss";

dayjs.extend(relativeTime);

async function post(url: string, csrfToken: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`);
  }
  return true;
}

function NotificationCard(item, { changedCallback, csrfToken }) {
  async function toggleStar() {
    const url = `/api/v1/plus/notifications/${item.id}/toggle-starred/`;
    await post(url, csrfToken);
  }

  async function deleteNotification() {
    const url = `/api/v1/plus/notifications/${item.id}/delete/`;
    await post(url, csrfToken);
  }

  return (
    <article className={`notification-card ${!item.read ? "unread" : ""}`}>
      <Button
        type="action"
        extraClasses="notification-card-star"
        icon={item.starred ? "star-filled" : "star"}
        onClickHandler={async () => {
          await toggleStar();
          changedCallback && changedCallback();
        }}
      >
        <span className="visually-hidden">Toggle Starring</span>
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

      <Button
        type="action"
        icon="trash"
        onClickHandler={async () => {
          await deleteNotification();
          changedCallback && changedCallback();
        }}
      >
        <span className="visually-hidden">Delete</span>
      </Button>
    </article>
  );
}

function NotificationsLayout() {
  const locale = useLocale();
  const location = useLocation();

  const { selectedTerms, selectedFilter, selectedSort } =
    useContext(searchFiltersContext);

  const starredUrl = `/${locale}/plus/notifications/starred`;

  let listUrl = `/api/v1/plus/notifications/?${selectedTerms}&${selectedFilter}&${selectedSort}`;
  if (location.pathname === starredUrl) {
    listUrl += "&filterStarred=true";
  }

  const tabs = [
    {
      label: "All Notifications",
      path: `/${locale}/plus/notifications`,
    },
    {
      label: "Starred",
      path: starredUrl,
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
