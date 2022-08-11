import React from "react";
import { BookmarkData } from ".";
import { Button } from "../../ui/atoms/button";
import { EditCollection } from "../../ui/molecules/collection/edit-collection";
import { Breadcrumbs } from "../../ui/molecules/breadcrumbs";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { docCategory } from "../../utils";
import { _getIconLabel } from "../common";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useOnlineStatus } from "../../hooks";
import { FrequentlyViewedEntry } from "../../document/types";

dayjs.extend(relativeTime);

export function CollectionListItem({
  item,
  onEditSubmit,
  handleDelete,
}: {
  item: BookmarkData | FrequentlyViewedEntry;
  onEditSubmit?: CallableFunction;
  handleDelete: (item: BookmarkData | FrequentlyViewedEntry) => Promise<void>;
}) {
  const [show, setShow] = React.useState(false);
  const { isOnline } = useOnlineStatus();

  const iconClass = docCategory({ pathname: item.url })?.split("-")[1];
  const iconLabel = _getIconLabel(item.url);

  return (
    <li className="icon-card">
      <div className="icon-card-title-wrap">
        <div className={`icon-card-icon ${iconClass || ""}`}>
          <span>{iconLabel}</span>
        </div>
        <div className="icon-card-content">
          {item.parents && item.parents.length > 0 && (
            <Breadcrumbs parents={item.parents} />
          )}
          <h2 className="icon-card-title">
            <a href={item.url}>{item.title}</a>
          </h2>
        </div>
        {"created" in item && (
          <time
            className="collection-created"
            dateTime={dayjs(item.created).toISOString()}
          >
            {`Added ${dayjs(item.created).fromNow().toString()}`}
          </time>
        )}
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
                {"id" in item && onEditSubmit && (
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
      {"notes" in item && item.notes && (
        <p className="icon-card-description">{item.notes}</p>
      )}
    </li>
  );
}
