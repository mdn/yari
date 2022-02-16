import React from "react";

import { PageContentContainer } from "../ui/atoms/page-content";
import { useUserData } from "../user-context";

const SettingsApp = React.lazy(() => import("./settings"));

export function OfflineSettings() {
  const user = useUserData();
  const pageTitle = "Settings";
  return (
    <PageContentContainer extraClasses="settings">
      <h1 className="slab-highlight">{pageTitle} </h1>
      {user?.isSubscriber && <SettingsApp />}
    </PageContentContainer>
  );
}
