import { Button } from "../../atoms/button";

import "./index.scss";

export const HeaderNotificationsMenu = () => {
  const notificationCount = 2;

  return (
    <div className="notifications-menu">
      <Button ariaHasPopup={"menu"} extraClasses="ghost notifications-button">
        <span className="notifications-label">Notifications</span>
        <span
          className={`notifications-count ${
            notificationCount > 0 ? "unread-notifications" : ""
          }`}
          aria-label={`You currently have ${notificationCount} notifications`}
        >
          {notificationCount}
        </span>
      </Button>
    </div>
  );
};
