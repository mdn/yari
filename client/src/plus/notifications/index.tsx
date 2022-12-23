import { useLocale } from "../../hooks";
import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";

import "./index.scss";

import { useUserData } from "../../user-context";
import { TabVariant, TAB_INFO, useCurrentTab } from "../common/tabs";
import { NotSignedIn } from "../common";
import { NotificationsTab, StarredNotificationsTab } from "./notifications-tab";
import { WatchedTab } from "./watched-items-tab";

function NotificationsLayout() {
  const locale = useLocale();
  const userData = useUserData();

  const currentTab = useCurrentTab(locale);

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
          {currentTab === TabVariant.NOTIFICATIONS && <NotificationsTab />}
          {currentTab === TabVariant.STARRED && <StarredNotificationsTab />}
          {currentTab === TabVariant.WATCHING && <WatchedTab />}
        </Container>
      )}
      {!userData && !isAuthed && <NotSignedIn />}
    </>
  );
}

export default function Notifications() {
  return <NotificationsLayout />;
}
