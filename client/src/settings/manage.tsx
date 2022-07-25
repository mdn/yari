import { FXA_MANAGE_SUBSCRIPTIONS_URL, FXA_SETTINGS_URL } from "../env";
import { useUserData } from "../user-context";

export function Manage() {
  const user = useUserData();
  return (
    <section className="field-group">
      <h2>Manage account</h2>
      <ul>
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
