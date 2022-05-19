// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '.'. Did you mean to set the 'm... Remove this comment to see the full error message
import { BookmarkData } from ".";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/atoms/button'. Did yo... Remove this comment to see the full error message
import { Button } from "../../ui/atoms/button";
import { EditCollection } from "../../ui/molecules/collection/edit-collection";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/breadcrumbs... Remove this comment to see the full error message
import { Breadcrumbs } from "../../ui/molecules/breadcrumbs";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/dropdown'. ... Remove this comment to see the full error message
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { docCategory } from "../../utils";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../common'. Did you mean to se... Remove this comment to see the full error message
import { _getIconLabel } from "../common";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs'. Did you mean to set th... Remove this comment to see the full error message
import dayjs from "dayjs";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs/plugin/relativeTime'. Di... Remove this comment to see the full error message
import relativeTime from "dayjs/plugin/relativeTime";
import { useOnlineStatus } from "../../hooks";

dayjs.extend(relativeTime);

export function CollectionListItem({
  item,
  showEditButton,
  onEditSubmit,
  handleDelete,
}: {
  item: BookmarkData;
  showEditButton: boolean;
  onEditSubmit: CallableFunction;
  handleDelete: (item: BookmarkData) => Promise<void>;
}) {
  const [show, setShow] = React.useState(false);
  const { isOnline } = useOnlineStatus();

  const iconClass = docCategory({ pathname: item.url })?.split("-")[1];
  const iconLabel = _getIconLabel(item.url);

  return (
    <article key={item.id} className="icon-card">
      <div className="icon-card-title-wrap">
        <div className={`icon-card-icon ${iconClass || ""}`}>
          <span>{iconLabel}</span>
        </div>
        <div className="icon-card-content">
          {item.parents.length > 0 && <Breadcrumbs parents={item.parents} />}
          <h2 className="icon-card-title">
            <a href={item.url}>{item.title}</a>
          </h2>
        </div>
        <time
          className="collection-created"
          dateTime={dayjs(item.created).toISOString()}
        >
          {`Added ${dayjs(item.created).fromNow().toString()}`}
        </time>
        {isOnline && (
          <DropdownMenuWrapper
            className="dropdown is-flush-right"
            isOpen={show}
            setIsOpen={(value, event) => {
              if (
                !document
                  .querySelector(".modal-content")
                  ?.contains(event.target)
              ) {
                setShow(value);
              }
            }}
          >
            <Button
              type="action"
              icon="ellipses"
              ariaControls="collection-list-item-dropdown"
              ariaHasPopup={"menu"}
              ariaExpanded={show || undefined}
              onClickHandler={() => {
                setShow(!show);
              }}
            />
            <DropdownMenu>
              <ul className="dropdown-list" id="collection-item-dropdown">
                {showEditButton && (
                  <li className="dropdown-item">
                    <EditCollection
                      item={item}
                      onEditSubmit={(e, item) => {
                        setShow(false);
                        onEditSubmit(e, item);
                      }}
                    />
                  </li>
                )}
                <li className="dropdown-item">
                  <Button
                    type="action"
                    title="Delete"
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
      {item.notes && <p className="icon-card-description">{item.notes}</p>}
    </article>
  );
}
