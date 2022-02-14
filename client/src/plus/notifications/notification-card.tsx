import React from "react";
import { Button } from "../../ui/atoms/button";
import { post } from "./utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { useUIStatus } from "../../ui-context";
import parse from "html-react-parser";

dayjs.extend(relativeTime);

export default function NotificationCard({ item, changedCallback, csrfToken }) {
  const toggleStarUrl = `/api/v1/plus/notifications/${item.id}/toggle-starred/`;
  const deleteUrl = `/api/v1/plus/notifications/${item.id}/delete/`;
  const undoUrl = `/api/v1/plus/notifications/${item.id}/undo-deletion/`;
  const [show, setShow] = React.useState(false);
  const [dynamicContent, setDynamicContent] = React.useState(null);
  const { setToastData } = useUIStatus();

  React.useEffect(() => {
    const regex = /PR!(?<repo>.+\/.+)!(?<pr>\d+)!!/;
    const groups = item.text.match(regex)?.groups;
    if (groups !== undefined) {
      const content = item.text.replace(
        regex,
        `<a href="https://github.com/${groups.repo}/pull/${groups.pr}">#${groups.pr}</a>`
      );
      setDynamicContent(content);
    }
  }, [item.text]);

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
          {dynamicContent ? (
            <p className="notification-card-text">{parse(dynamicContent)}</p>
          ) : (
            <p className="notification-card-text">{item.text}</p>
          )}
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
                  setToastData({
                    mainText: `${item.title} removed from your collection`,
                    shortText: "Article removed",
                    buttonText: "UNDO",
                    buttonHandler: async () => {
                      await post(undoUrl, csrfToken);
                      changedCallback && changedCallback();
                      setToastData(null);
                    },
                  });
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
