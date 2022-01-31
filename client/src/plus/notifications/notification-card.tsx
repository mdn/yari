import React, { useState } from "react";
import { Button } from "../../ui/atoms/button";
import { post } from "./utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";

dayjs.extend(relativeTime);

export default function NotificationCard({ item, changedCallback, csrfToken }) {
  const toggleStarUrl = `/api/v1/plus/notifications/${item.id}/toggle-starred/`;
  const deleteUrl = `/api/v1/plus/notifications/${item.id}/delete/`;
  const [show, setShow] = React.useState(false);

  return (
    <article className={`notification-card ${!item.read ? "unread" : ""}`}>
      <Button
        type="action"
        extraClasses="notification-card-star"
        icon={item.starred ? "star-filled" : "star"}
        onClickHandler={async () => {
          await post(toggleStarUrl, csrfToken);
          changedCallback && changedCallback();
        }}
      >
        <span className="visually-hidden">Toggle Starring</span>
      </Button>

      <a href={item.url}>
        <div className="notification-card-description">
          <h2 className="notification-card-title">{item.title}</h2>
          <p className="notification-card-text">{item.text}</p>
        </div>
      </a>

      <time
        className="notification-card-created"
        dateTime={dayjs(item.created).toISOString()}
      >
        {dayjs(item.created).fromNow().toString()}
      </time>

      <DropdownMenuWrapper
        className="dropdown is-flush-right"
        isOpen={show}
        setIsOpen={setShow}
      >
        <Button
          type="action"
          icon="ellipses"
          ariaControls="watch-card-dropdown"
          ariaHasPopup={"menu"}
          ariaExpanded={show || undefined}
          onClickHandler={() => {
            setShow(!show);
          }}
        />
        <DropdownMenu>
          <ul className="dropdown-list" id="watch-card-dropdown">
            <li className="dropdown-item">
              <Button
                type="action"
                onClickHandler={async () => {
                  await post(deleteUrl, csrfToken);
                  changedCallback && changedCallback();
                }}
              >
                Delete
              </Button>
            </li>
          </ul>
        </DropdownMenu>
      </DropdownMenuWrapper>
    </article>
  );
}
