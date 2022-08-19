import React from "react";

import { OfflineStatusBar } from "../ui/molecules/offline-status-bar";

import "./index.scss";
import { Manage } from "./manage";

const OfflineSettings = React.lazy(() => import("./offline-settings"));
const FeaturePreview = React.lazy(() => import("./feature-preview"));

export function Settings() {
  const pageTitle = "My Settings";

  return (
    <>
      <OfflineStatusBar />
      <article className="settings">
        <h1 className="slab-highlight _ify">{pageTitle} </h1>
        <Manage />
        <FeaturePreview />
        <OfflineSettings />
      </article>
    </>
  );
}
