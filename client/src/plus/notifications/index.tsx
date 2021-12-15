import { useLocale } from "../../hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Button } from "../../ui/atoms/button";
import Container from "../../ui/atoms/container";
import List from "../common/list";
import Tabs from "../../ui/molecules/tabs";

import "./index.scss";

function Notification(item) {
  return (
    <article className="notification-card">
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
    </article>
  );
}

export default function Notifications() {
  const locale = useLocale();

  const tabs = [
    {
      label: "All Notifications",
      path: `/${locale}/plus/notifications/`,
    },
    {
      label: "Watch List",
      path: `/${locale}/plus/notifications/watch`,
    },
    {
      label: "Starred",
      path: `/${locale}/plus/notifications/starred`,
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
        <List component={Notification} apiUrl="/api/v1/plus/notifications/" />
      </Container>
    </>
  );
}
