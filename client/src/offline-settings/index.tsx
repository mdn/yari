import React from "react";
import { useLocale } from "../hooks";

import { OfflineStatusBar } from "../ui/molecules/offline-status-bar";
import { PageContentContainer } from "../ui/atoms/page-content";
import { useUserData } from "../user-context";

import "./index.scss";

const SettingsApp = React.lazy(() => import("./settings"));

export function OfflineSettings() {
  const locale = useLocale();
  const user = useUserData();
  const pageTitle = "Offline Settings";
  return (
    <>
      <OfflineStatusBar />
      <PageContentContainer extraClasses="settings">
        <h1 className="slab-highlight">{pageTitle} </h1>
        {(user?.isSubscriber && <SettingsApp />) || (
          <section>
            MDN offline is only available to Supporters{" "}
            <a href={`/${locale}/plus`}>learn more</a>.
          </section>
        )}
      </PageContentContainer>
    </>
  );
}
