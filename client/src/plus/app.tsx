// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { useSearchParams } from "react-router-dom";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../ui/atoms/notification'. Did... Remove this comment to see the full error message
import Notification from "../ui/atoms/notification";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../ui/atoms/subscribe-link'. D... Remove this comment to see the full error message
import { SubscribeLink } from "../ui/atoms/subscribe-link";

import "./index.scss";

export default function App() {
  const [searchParams] = useSearchParams();

  return (
    <div className="plus">
      {searchParams.get("reason") === "no-active-subscription-found" && (
        <Notification>
          <p>You are not a subscriber yet.</p>
        </Notification>
      )}

      <p>
        <SubscribeLink />
      </p>
    </div>
  );
}
