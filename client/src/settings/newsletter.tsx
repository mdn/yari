import { useEffect, useState } from "react";
import { FeatureId } from "../constants";
import { useViewedState } from "../hooks";
import {
  getNewsletterSubscription,
  toggleNewsletterSubscription,
} from "../plus/common/api";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { SubscriptionType, useUserData } from "../user-context";

export default function Newsletter() {
  const [loading, setLoading] = useState<boolean>(true);
  const user = useUserData();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      setEnabled(await getNewsletterSubscription());
      setLoading(false);
    })();
  }, []);
  const { isViewed, setViewed } = useViewedState();
  if (!isViewed(FeatureId.PLUS_NEWSLETTER)) {
    setViewed(FeatureId.PLUS_NEWSLETTER);
  }

  return (
    <section className="field-group">
      <h2>Newsletter</h2>
      {user?.subscriptionType &&
      user?.subscriptionType !== SubscriptionType.MDN_CORE ? (
        <ul>
          <li>
            <h3>Receive updates from MDN Plus</h3>
            <span>
              Allow us to email you product updates, news about our latest
              features, tips to get the most out of MDN Plus, and more.
            </span>
            {loading ? (
              <Spinner extraClasses="loading" />
            ) : (
              <Switch
                name="mdn_plus_newsletter"
                checked={Boolean(enabled)}
                toggle={async (e) => {
                  setLoading(true);
                  setEnabled(
                    await toggleNewsletterSubscription(
                      Boolean(e.target.checked)
                    )
                  );
                  setLoading(false);
                }}
              ></Switch>
            )}
          </li>
        </ul>
      ) : (
        <>
          The MDN Plus newsletter is only available to MDN Plus subscribers.{" "}
          <a href={`/en-US/plus#subscribe`}>Learn more</a> about our plans.
        </>
      )}
    </section>
  );
}
