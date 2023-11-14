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
      <h2>Manage Account</h2>
      <ul>
        {PLACEMENT_ENABLED && (
          <li>
            <h3 id="ad-free-experience">Ad-Free Experience</h3>
            <section
              className="setting-row"
              aria-labelledby="ad-free-experience"
            >
              {isPlusSubscriber(user) ? (
                <>
                  <span>
                    Opt out of ads on MDN.{" "}
                    <a href="/en-US/advertising">Learn more</a> about MDN ads.
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
                  The ads free feature is only available to MDN Plus
                  subscribers.{" "}
                  <a href={`/en-US/plus?ref=nope_settings#subscribe`}>
                    Learn more
                  </a>{" "}
                  about our plans.
                </p>
              )}
            </section>
          </li>
        )}

        <li>
          <h3 id="account">Account</h3>
          <section className="setting-row" aria-labelledby="account">
            <span>Manage preferences for your account</span>
            <a
              rel="noreferrer noopener"
              target="_blank"
              href={FXA_SETTINGS_URL}
              className="manage external"
            >
              Account
            </a>
          </section>
        </li>
        {user?.isSubscriber && (
          <li>
            <h3 id="mdn-plus-subscription">MDN Plus Subscription</h3>
            <section
              className="setting-row"
              aria-labelledby="mdn-plus-subscription"
            >
              <span>Manage your payment details for MDN Plus.</span>
              <a
                rel="noreferrer noopener"
                target="_blank"
                href={FXA_MANAGE_SUBSCRIPTIONS_URL}
                className="manage external"
              >
                Subscriptions
              </a>
            </section>
          </li>
        )}
      </ul>
    </section>
  );
}
