import { useState } from "react";
import { useLocale } from "../hooks";
import { toggleCollectionsInQuickSearch } from "../plus/common/api";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { SubscriptionType, useUserData } from "../user-context";

export default function FeaturePreview() {
  const serviceWorkerAvailable = window?.navigator?.serviceWorker;

  const [saving, setSaving] = useState<boolean>(false);
  const user = useUserData();
  const locale = useLocale();

  return (
    <section className="field-group">
      <h2>Feature preview</h2>
      {user?.subscriptionType &&
      [SubscriptionType.MDN_PLUS_10M, SubscriptionType.MDN_PLUS_10Y].includes(
        user?.subscriptionType
      ) ? (
        serviceWorkerAvailable ? (
          <ul>
            <li>
              <h3>Collections in quick search</h3>
              <span>
                Prioritizes items from your collection when using quick search.
              </span>
              {(saving === true && <Spinner extraClasses="loading" />) || (
                <Switch
                  name="offline"
                  checked={Boolean(user?.settings?.colInSearch)}
                  toggle={async (e) => {
                    setSaving(true);
                    await toggleCollectionsInQuickSearch(
                      Boolean(e.target.checked)
                    );
                    user?.mutate();
                    setSaving(false);
                  }}
                ></Switch>
              )}
            </li>
          </ul>
        ) : (
          <>
            <h3>Offline mode is unavailable </h3>{" "}
            <p>
              Please make sure that you are not using a private or incognito
              window.
            </p>
          </>
        )
      ) : (
        <>
          Feature preview is only available to MDN Plus 10 subscribers.{" "}
          <a href={`/${locale}/plus#subscribe`}>Learn more</a> about our plans.
        </>
      )}
    </section>
  );
}
