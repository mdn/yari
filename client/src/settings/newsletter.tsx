import { useEffect, useState } from "react";
import {
  getNewsletterSubscription,
  toggleNewsletterSubscription,
} from "../plus/common/api";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { SubscriptionType, useUserData } from "../user-context";

export default function Newsletter() {
  const [loading, setLoading] = useState<boolean>(false);
  const user = useUserData();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      setEnabled(await getNewsletterSubscription());
    })();
  }, []);

  return (
    <section className="field-group">
      <h2>Emails</h2>
      {user?.subscriptionType &&
      user?.subscriptionType !== SubscriptionType.MDN_CORE ? (
        <ul>
          <li>
            <h3>Receive updates from MDN Plus</h3>
            <span>
              This will keep you up to date on what's happening with MDN Plus.
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
          Feature preview is only available to MDN Supporter 10 subscribers.{" "}
          <a href={`/en-US/plus#subscribe`}>Learn more</a> about our plans.
        </>
      )}
    </section>
  );
}
