import React from "react";

import { mutate } from "swr";
import { Button } from "../../ui/atoms/button";
import { post } from "./utils";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";

export default function WatchCard({ item, changedCallback, csrfToken }) {
  const deleteUrl = `/api/v1/plus/watch${item.url}`;
  const [show, setShow] = React.useState(false);

  return (
    <article className="notification-card no-star">
      <div className="notification-card-description">
        <h2 className="notification-card-title">{item.title}</h2>
        <p className="notification-card-text">
          <a href={item.url}>{item.url}</a>
        </p>
      </div>

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
                  console.log(deleteUrl);
                  await post(deleteUrl, csrfToken, { unwatch: true });
                  mutate(deleteUrl);
                  changedCallback && changedCallback();
                }}
              >
                Unwatch
              </Button>
            </li>
          </ul>
        </DropdownMenu>
      </DropdownMenuWrapper>
    </article>
  );
}
