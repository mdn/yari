import React from "react";

import "./index.scss";

export const CustomizeNotificationsMenu = () => {
  const menuId = "customize-notifications-submenu";
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  return (
    <>
      <form
        className={`${menuId} ${menuId === visibleSubMenuId ? "show" : ""}`}
        role="menu"
        aria-labelledby={`${menuId}-button`}
      >
        <div className="watch-submenu-header">Notifications</div>

        <div className="watch-submenu-item">
          <input
            type="checkbox"
            id="customize_content_updates"
            name="CustomizeContentUpdates"
          />
          <label htmlFor="customize_content_updates">Content Updates</label>
        </div>

        <div className="watch-submenu-item">
          <input
            type="checkbox"
            id="customize_browser_compat"
            name="CustomizeBrowserCompat"
          />
          <label htmlFor="customize_browser_compat">
            Browser Compatability Data
          </label>
        </div>

        <button>Set as global default</button>
      </form>
    </>
  );
};
