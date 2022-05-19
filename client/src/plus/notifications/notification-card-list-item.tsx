// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs'. Did you mean to set th... Remove this comment to see the full error message
import dayjs from "dayjs";
// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
import { useOnlineStatus } from "../../hooks";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/atoms/button'. Did yo... Remove this comment to see the full error message
import { Button } from "../../ui/atoms/button";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/dropdown'. ... Remove this comment to see the full error message
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { Checkbox } from "../../ui/molecules/notifications-watch-menu/atoms/checkbox";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'html-react-parser'. Did you me... Remove this comment to see the full error message
import parse from "html-react-parser";

const regex = /PR!(?<repo>.+\/.+)!(?<pr>\d+)!!/;

export default function NotificationCardListItem({
  toggleSelected,
  toggleStarred,
  item,
  handleDelete,
}) {
  const [show, setShow] = React.useState(false);
  let textWithPr;
  const { isOnline } = useOnlineStatus();

  const groups = item.text.match(regex)?.groups;
  if (groups !== undefined) {
    const content = item.text.replace(
      regex,
      `<a href="https://github.com/${groups.repo}/pull/${groups.pr}"  
          target="_blank"
          rel="noreferrer noopener"
          className="external"
          >#${groups.pr}</a>`
    );
    textWithPr = content;
  }

  return (
    <li
      className={`notification-card ${!item.read ? "unread" : ""}`}
      key={item.id}
    >
      <div>
        {isOnline && (
          <>
            <Checkbox
              name="selected"
              checked={item.checked}
              onChange={(e) => toggleSelected(item, e.target.value)}
            />
            <Button
              type="action"
              extraClasses="notification-card-star"
              icon={item.starred ? "star-filled" : "star"}
              onClickHandler={() => toggleStarred(item)}
            >
              <span className="visually-hidden">Toggle Starring</span>
            </Button>
          </>
        )}

        <a href={item.url} className="notification-card-description">
          <h2 className="notification-card-title">{item.title}</h2>
          {textWithPr ? (
            <p className="notification-card-text">{parse(textWithPr)}</p>
          ) : (
            <p className="notification-card-text">{item.text}</p>
          )}
        </a>
      </div>

      <div>
        <time
          className="notification-card-created desktop-only"
          dateTime={dayjs(item.created).toISOString()}
        >
          {dayjs(item.created).fromNow().toString()}
        </time>

        {isOnline && (
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
                    onClickHandler={() => handleDelete(item)}
                  >
                    Delete
                  </Button>
                </li>
              </ul>
            </DropdownMenu>
          </DropdownMenuWrapper>
        )}
      </div>
    </li>
  );
}
