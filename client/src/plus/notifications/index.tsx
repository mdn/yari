import { useState } from "react";

import { useLocale } from "../../hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { SearchFiltersProvider } from "../contexts/search-filters";

import { Button } from "../../ui/atoms/button";
import Container from "../../ui/atoms/container";
import List from "../common/list";
import SearchFilter from "../search-filter";
import Tabs from "../../ui/molecules/tabs";

import "./index.scss";

dayjs.extend(relativeTime);

function NotificationCard(item) {
  return (
    <article className={`notification-card ${!item.read ? "unread" : ""}`}>
      <Button type="action" extraClasses="notification-card-star" icon="star" />

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

      <Button type="action" icon="ellipses"></Button>
    </article>
  );
}

export default function Notifications() {
  const locale = useLocale();
  const [listUrl] = useState("/api/v1/plus/notifications/");

  const tabs = [
    {
      label: "All Notifications",
      path: `/${locale}/plus/notifications/`,
    },
    {
      label: "Watch List",
      path: `/${locale}/plus/notifications/watched`,
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
      label: "Time",
      param: "sort=time",
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
        <SearchFiltersProvider>
          <SearchFilter filters={filters} sorts={sorts} />
          <List component={NotificationCard} apiUrl={listUrl} />
        </SearchFiltersProvider>
      </Container>
    </>
  );
}
