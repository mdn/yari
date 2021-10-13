import { Button } from "../../atoms/button";

import "./index.scss";

export const HeaderNotificationsMenu = () => {
  const notificationCount = 0;

  return (
    <div className="notifications-menu">
      <Button
        ariaHasPopup={"menu"}
        extraClasses="ghost notifications-button"
        aria-label={`You currently have ${notificationCount} notifications`}
      >
        <span className="notifications-label">Notifications</span>
        <span
          className={`notifications-count-container ${
            notificationCount > 0 ? "unread-notifications" : ""
          }`}
        >
          <span className="notifications-count">{notificationCount}</span>
        </span>
      </Button>
    </div>
  );
};
