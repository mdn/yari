import React from "react";
import { BookmarkData } from ".";
import { Button } from "../../ui/atoms/button";
import { EditCollection } from "../../ui/molecules/collection/edit-collection";
import { Breadcrumbs } from "../../ui/molecules/breadcrumbs";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { docCategory } from "../../utils";
import { _getIconLabel } from "../common";

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
  const [doomed, setDoomed] = React.useState(false);

  let className = "icon-card";
  if (doomed) {
    className += " doomed";
  }
  const iconClass = docCategory({ pathname: item.url })?.split("-")[1];
  const iconLabel = _getIconLabel(item.url);

  return (
    <article key={item.id} className={className}>
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
        <DropdownMenuWrapper
          className="dropdown is-flush-right"
          isOpen={show}
          setIsOpen={(value, event) => {
            if (
              !document.querySelector(".modal-content")?.contains(event.target)
            ) {
              setShow(value);
            }
          }}
        >
          <Button
            type="action"
            icon="ellipses"
            ariaControls="bookmark-dropdown"
            ariaHasPopup={"menu"}
            ariaExpanded={show || undefined}
            onClickHandler={() => {
              setShow(!show);
            }}
          />
          <DropdownMenu>
            <ul className="dropdown-list" id="bookmark-dropdown">
              {showEditButton && (
                <li className="dropdown-item">
                  <EditCollection item={item} onEditSubmit={onEditSubmit} />
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
      </div>
      {item.notes && <p className="icon-card-description">{item.notes}</p>}
    </article>
  );
}
