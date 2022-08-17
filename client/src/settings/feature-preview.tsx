import { useState } from "react";
import {
  toggleCollectionsInQuickSearch,
  toggleMultipleCollections,
} from "../plus/common/api";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { SubscriptionType, useUserData } from "../user-context";

export default function FeaturePreview() {
  const serviceWorkerAvailable = window?.navigator?.serviceWorker;

  const [saving, setSaving] = useState<boolean>(false);
  const user = useUserData();

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
                <br />
                <a
                  rel="noreferrer noopener"
                  target="_blank"
                  href="https://www.surveygizmo.com/s3/6918430/Feature-Preview-User-Feedback-Collections-in-Quicksearch"
                >
                  Give us some feedback.
                </a>
              </span>
              {saving ? (
                <Spinner extraClasses="loading" />
              ) : (
                <Switch
                  name="col_in_search"
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
            <li>
              <h3>Multiple collections</h3>
              <span>
                Allows you to create and manage multiple collections.
                <br />
                <a
                  rel="noreferrer noopener"
                  target="_blank"
                  href="https://www.surveygizmo.com/s3/6918430/Feature-Preview-User-Feedback-Collections-in-Quicksearch"
                >
                  Give us some feedback.
                </a>
              </span>
              {saving ? (
                <Spinner extraClasses="loading" />
              ) : (
                <Switch
                  name="multiple_collections"
                  checked={Boolean(user?.settings?.multipleCollections)}
                  toggle={async (e) => {
                    setSaving(true);
                    await toggleMultipleCollections(Boolean(e.target.checked));
                    user?.mutate();
                    setSaving(false);
                  }}
                ></Switch>
              )}
            </li>
          </ul>
        ) : (
          <>
            <h3>Collections in quick search is unavailable</h3>{" "}
            <p>
              Please make sure that you are not using a private or incognito
              window.
            </p>
          </>
        )
      ) : (
        <>
          Feature preview is only available to MDN Supporter 10 subscribers.{" "}
          <a href={`/en-US/plus#subscribe`}>Learn more</a> about our plans.
        </>
      )}
    </section>
  );
}
