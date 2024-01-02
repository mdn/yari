import React from "react";
import { NEWSLETTER_ENABLED } from "../env";

import { OfflineStatusBar } from "../ui/molecules/offline-status-bar";

import "./index.scss";
import { Manage } from "./manage";
import Newsletter from "./newsletter";
import { ManageAIHelp } from "./ai-help";

const OfflineSettings = React.lazy(() => import("./offline-settings"));

export function Settings() {
  const pageTitle = "Settings";
  return (
    <>
      <OfflineStatusBar />
      <article className="settings">
        <h1 className="slab-highlight _ify">{pageTitle} </h1>
        <Manage />
        <ManageAIHelp />
        {NEWSLETTER_ENABLED && <Newsletter />}
        <OfflineSettings />
      </article>
    </>
  );
}
