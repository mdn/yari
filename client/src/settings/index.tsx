import React from "react";

import { OfflineStatusBar } from "../ui/molecules/offline-status-bar";
import { PageContentContainer } from "../ui/atoms/page-content";

import "./index.scss";

const SettingsApp = React.lazy(() => import("./offline-settings"));
const FeaturePreview = React.lazy(() => import("./feature-preview"));

export function Settings() {
  const pageTitle = "My Settings";

  return (
    <>
      <OfflineStatusBar />
      <PageContentContainer extraClasses="settings">
        <h1 className="slab-highlight _ify">{pageTitle} </h1>
        <FeaturePreview />
        <SettingsApp />
      </PageContentContainer>
    </>
  );
}
