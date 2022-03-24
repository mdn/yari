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
            MDN Offline is only available to MDN Plus subscribers.{" "}
            <a href={`/${locale}/plus#subscribe`}>Learn more</a> about our
            plans.
          </section>
        )}
      </PageContentContainer>
    </>
  );
}
