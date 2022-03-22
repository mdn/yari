import * as React from "react";

import { isPayingSubscriber } from "../../../utils";
import { useUserData } from "../../../user-context";

import "./index.scss";

export function OfflineStatusBar() {
  const user = useUserData();
  const statusBarRef = React.useRef<HTMLDivElement>(null);
  const initialOnlineStatus =
    navigator && "onLine" in navigator ? navigator.onLine : true;
  const [isOnline, setIsOnline] = React.useState(initialOnlineStatus);

  React.useEffect(() => {
    const statusBar = statusBarRef.current;

    window.addEventListener("online", () => {
      setIsOnline(true);
      statusBar?.classList.add("is-online");
    });

    window.addEventListener("offline", () => {
      setIsOnline(false);
    });

    if (statusBar) {
      // when the fade-out animation ends, remove the class so
      // the statusbar is hidden not just faded out.
      statusBar.addEventListener("animationend", () => {
        statusBar.classList.remove("is-online");
      });
    }
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
      ref={statusBarRef}
    >
      {isOnline ? "You are back online." : "You are reading offline."}
    </div>
  );
}
