import React, { useState } from "react";

import { Icon } from "../../atoms/icon";

type WatchMenuButton = {
  value: string;
  status: boolean;
  label: string;
  text?: string;
  onClickHandler?: React.MouseEventHandler;
};

export function NotificationsWatchMenuStart({
  data,
  setStepHandler,
  handleSelection,
}) {
  const watchMode = data.status;

  function WatchMenuButton({
    value,
    onClickHandler,
    status,
    label,
    text,
  }: WatchMenuButton) {
    return (
      <button
        role="menuitemradio"
        aria-checked={watchMode === value}
        className="watch-submenu-button"
        value={value}
        onClick={onClickHandler}
      >
        <span className="watch-submenu-button-wrap">
          {status && (
            <span className="watch-submenu-button-status">
              <Icon name="checkmark" />
            </span>
          )}

          <span className="watch-submenu-button-label">{label}</span>
          {text && <span className="watch-submenu-button-text">{text}</span>}
        </span>
      </button>
    );
  }

  return (
    <>
      <div className="watch-submenu-header">Notifications</div>

      <WatchMenuButton
        value="major"
        label="Major updates"
        text="Only receive notifications of major browser compatability releases and revisions to this article."
        status={watchMode === "major"}
        onClickHandler={(event) => {
          handleSelection();
        }}
      />

      <WatchMenuButton
        value="custom"
        label="Custom"
        text={
          watchMode === "custom"
            ? "Receiving customized notifications."
            : "Select which events you would like to be notified of."
        }
        status={watchMode === "custom"}
        onClickHandler={(event) => {
          event.preventDefault();
          setStepHandler(1);
        }}
      />

      <WatchMenuButton
        value="unwatch"
        label={watchMode === "unwatched" ? "Not watching" : "Unwatch"}
        text={
          watchMode === "unwatched"
            ? "Not receiving notifications about this article."
            : "Stop receiving notifications about this article."
        }
        status={watchMode === "unwatched"}
        onClickHandler={() => {
          handleSelection(true);
        }}
      />
    </>
  );
}
