import * as React from "react";

import { isPayingSubscriber } from "../../../utils";
import { useOnlineStatus } from "../../../hooks";
import { useUserData } from "../../../user-context";

import "./index.scss";

export function OfflineStatusBar() {
  const user = useUserData();
  const onlineStatus = useOnlineStatus();
  const statusBarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const statusBar = statusBarRef.current;
    const handleOnline = () => {
      statusBar?.classList.add("is-online");
    };

    window.addEventListener("online", handleOnline);

    if (statusBar) {
      // when the fade-out animation ends, remove the class so
      // the statusbar is hidden not just faded out.
      statusBar.addEventListener("animationend", () => {
        statusBar.classList.remove("is-online");
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [onlineStatus]);

  if (!isPayingSubscriber(user)) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className={
        onlineStatus.isOnline
          ? "offline-status-bar"
          : "offline-status-bar is-offline"
      }
      ref={statusBarRef}
    >
      {onlineStatus.isOnline
        ? "You are back online."
        : "You are reading offline."}
    </div>
  );
}
