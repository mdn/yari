import { useLocale } from "../../hooks";

import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";
import List from "../common/list";

function Notification(item) {
  return (
    <article>
      <h4>{item.title}</h4>
      <p>{item.text}</p>
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
      <List component={Notification} apiUrl="/api/v1/plus/notifications/" />
    </>
  );
}
