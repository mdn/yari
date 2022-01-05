import React from "react";

import { Button } from "../../atoms/button";
import { NotificationsWatchMenuCustom } from "../notifications-watch-menu-custom";
import { NotificationsWatchMenuStart } from "../notifications-watch-menu-start";

import "./index.scss";

export const NotificationsWatchMenu = ({ doc }) => {
  const menuId = "watch-submenu";
  const [show, setShow] = React.useState(false);
  const [visibleStep, setVisibleStep] = React.useState<number>(0);

  return (
    <>
      <Button
        type="action"
        id="watch-menu-button"
        icon="eye"
        extraClasses="small watch-menu"
        ariaHasPopup={"menu"}
        aria-label="Watch this page for updates"
        ariaExpanded={show}
        onClickHandler={() => {
          setShow(!show);
        }}
      >
        Watch
      </Button>

      <div
        className={`${menuId} ${show ? "show" : ""}`}
        role="menu"
        aria-labelledby={`${menuId}-button`}
      >
        {visibleStep === 0 ? (
          <NotificationsWatchMenuStart
            doc={doc}
            setStepHandler={setVisibleStep}
          />
        ) : (
          <NotificationsWatchMenuCustom
            doc={doc}
            setStepHandler={setVisibleStep}
          />
        )}
      </div>
    </>
  );
};
