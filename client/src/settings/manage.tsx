import { useState } from "react";
import {
  FXA_MANAGE_SUBSCRIPTIONS_URL,
  FXA_SETTINGS_URL,
  PLACEMENT_ENABLED,
} from "../env";
import { toggleNoAds } from "../plus/common/api";
import {
  TOGGLE_PLUS_ADS_FREE_DISABLED,
  TOGGLE_PLUS_ADS_FREE_ENABLED,
} from "../telemetry/constants";
import { useGleanClick } from "../telemetry/glean-context";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { useUserData } from "../user-context";
import { isPlusSubscriber } from "../utils";

export function Manage() {
  const [saving, setSaving] = useState<boolean>(false);
  const user = useUserData();
  const gleanClick = useGleanClick();

  return (
    <section className="field-group">
      <h2>Manage account</h2>
      <ul>
        {PLACEMENT_ENABLED && (
          <li>
            <h3>Go ads free</h3>
            {isPlusSubscriber(user) ? (
              <>
                <span>
                  Turn off advertising on MDN. Read more about{" "}
                  <a href="/en-US/advertising">ads on MDN</a>
                </span>
                {saving ? (
                  <Spinner extraClasses="loading" />
                ) : (
                  <Switch
                    name="no_ads"
                    checked={Boolean(user?.settings?.noAds)}
                    toggle={async (e) => {
                      setSaving(true);
                      const checked = Boolean(e.target.checked);
                      const source = checked
                        ? TOGGLE_PLUS_ADS_FREE_ENABLED
                        : TOGGLE_PLUS_ADS_FREE_DISABLED;
                      gleanClick(source);
                      await toggleNoAds(checked);
                      if (user?.settings) {
                        user.settings.noAds = checked;
                      }
                      user?.mutate();
                      setSaving(false);
                    }}
                  ></Switch>
                )}
              </>
            ) : (
              <p>
                The ads free feature is only available to MDN Plus subscribers.{" "}
                <a href={`/en-US/plus?ref=nope_settings#subscribe`}>
                  Learn more
                </a>{" "}
                about our plans.
              </p>
            )}
          </li>
        )}

        <li>
          <h3>Your account</h3>
          <span>Manage your account</span>
          <a
            rel="noreferrer noopener"
            target="_blank"
            href={FXA_SETTINGS_URL}
            className="manage external"
          >
            Your Account
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
