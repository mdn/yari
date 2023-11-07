import { useSearchParams } from "react-router-dom";
import Notification from "../ui/atoms/notification";
import { SignUpLink } from "../ui/atoms/signup-link";

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
        <SignUpLink />
      </p>
    </div>
  );
}
