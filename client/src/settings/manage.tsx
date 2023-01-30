import { useState } from "react";
import { FXA_MANAGE_SUBSCRIPTIONS_URL, FXA_SETTINGS_URL } from "../env";
import { toggleNoAds } from "../plus/common/api";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { useUserData } from "../user-context";

export function Manage() {
  const [saving, setSaving] = useState<boolean>(false);
  const user = useUserData();
  return (
    <section className="field-group">
      <h2>Manage account</h2>
      <ul>
        <li>
          <h3>No Ads</h3>
          <span>
            Stop showing advertisement on MDN
            <br />
            <a
              rel="noreferrer noopener"
              target="_blank"
              href="https://survey.alchemer.com/s3/6918430/Feature-Preview-User-Feedback-Collections-in-Quicksearch"
            >
              Give us some feedback.
            </a>
          </span>
          {saving ? (
            <Spinner extraClasses="loading" />
          ) : (
            <Switch
              name="col_in_search"
              checked={Boolean(user?.settings?.noAds)}
              toggle={async (e) => {
                setSaving(true);
                await toggleNoAds(Boolean(e.target.checked));
                user?.mutate();
                setSaving(false);
              }}
            ></Switch>
          )}
        </li>
        <li>
          <h3>Firefox account</h3>
          <span>Manage your Firefox account</span>
          <a
            rel="noreferrer noopener"
            target="_blank"
            href={FXA_SETTINGS_URL}
            className="manage external"
          >
            Firefox account
          </a>
        </li>
        {user?.isSubscriber && (
          <li>
            <h3>Subscription</h3>
            <span>Manage your MDN Plus subscription</span>
            <a
              rel="noreferrer noopener"
              target="_blank"
              href={FXA_MANAGE_SUBSCRIPTIONS_URL}
              className="manage external"
            >
              Subscriptions
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}
