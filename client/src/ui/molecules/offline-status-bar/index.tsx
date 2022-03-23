import * as React from "react";

import { isPayingSubscriber } from "../../../utils";
import { useOnlineStatus } from "../../../hooks";
import { useUserData } from "../../../user-context";

import "./index.scss";

export function OfflineStatusBar() {
  const user = useUserData();
  const { isOnline } = useOnlineStatus();
  const statusBarRef = React.useRef<HTMLDivElement>(null);
  const isPremiumSubscriber = React.useMemo(
    () => !isPayingSubscriber(user),
    [user]
  );

  React.useEffect(() => {
    const statusBar = statusBarRef.current;
    const handleOnline = () => {
      statusBar?.classList.add("is-online");
    };

    window.addEventListener("online", handleOnline);

    statusBar?.addEventListener("animationend", () => {
      statusBar.classList.remove("is-online");
    });

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isPremiumSubscriber) {
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
