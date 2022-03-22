import * as React from "react";

import { isPayingSubscriber } from "../../../utils";
import { useUserData } from "../../../user-context";

import "./index.scss";

export function OfflineStatusBar() {
  const user = useUserData();
  const initialOnlineStatus = "onLine" in navigator ? navigator.onLine : true;
  const [isOnline, setIsOnline] = React.useState(initialOnlineStatus);

  React.useEffect(() => {
    window.addEventListener("online", () => {
      setIsOnline(true);
    });

    window.addEventListener("offline", () => {
      setIsOnline(false);
    });
  }, [isOnline]);

  if (!isPayingSubscriber(user)) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className={
        isOnline ? "offline-status-bar" : "offline-status-bar is-offline"
      }
    >
      You are reading offline.
    </div>
  );
}
