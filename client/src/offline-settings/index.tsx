// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
import { useLocale } from "../hooks";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../ui/molecules/offline-status... Remove this comment to see the full error message
import { OfflineStatusBar } from "../ui/molecules/offline-status-bar";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../ui/atoms/page-content'. Did... Remove this comment to see the full error message
import { PageContentContainer } from "../ui/atoms/page-content";
import { useUserData } from "../user-context";

import "./index.scss";

// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
const SettingsApp = React.lazy(() => import("./settings"));

export function OfflineSettings() {
  const locale = useLocale();
  const user = useUserData();
  const pageTitle = "MDN Offline";

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
