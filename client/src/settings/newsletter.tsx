import { useEffect, useState } from "react";
import { FeatureId } from "../constants";
import { useViewedState } from "../hooks";
import {
  getNewsletterSubscription,
  toggleNewsletterSubscription,
} from "../plus/common/api";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";

export default function Newsletter() {
  const [loading, setLoading] = useState<boolean>(true);
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
      <h2 id="newsletter">Stay updated</h2>
      <ul>
        <li>
          <section aria-labelledby="mdn-plus-newsletter">
            <h3 id="mdn-plus-newsletter">MDN Plus Newsletter</h3>
            <div className="setting-row">
              <span>
                Allow us to email you product updates, news, and more.
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
            </div>
          </section>
        </li>
      </ul>
    </section>
  );
}
