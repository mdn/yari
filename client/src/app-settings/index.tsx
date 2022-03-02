import React from "react";

import { PageContentContainer } from "../ui/atoms/page-content";

const SettingsApp = React.lazy(() => import("./settings"));

export function AppSettings() {
  const pageTitle = "Settings";
  return (
    <PageContentContainer extraClasses="settings">
      <h1 className="slab-highlight">{pageTitle} </h1>
      <SettingsApp></SettingsApp>
    </PageContentContainer>
  );
}
