import React from "react";
import { useOnlineStatus } from "../../hooks";
import { Button } from "../../ui/atoms/button";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { Checkbox } from "../../ui/atoms/checkbox";
import { getCategoryByPathname } from "../../utils";
import { _getIconLabel } from "../common";
import "./index.scss";

export default function WatchedCardListItem({
  item,
  onUnwatched,
  toggleSelected,
}) {
  const [show, setShow] = React.useState(false);
  const { isOnline } = useOnlineStatus();

  const iconClass = getCategoryByPathname(item.url);
  const iconLabel = _getIconLabel(item.url);

  return (
    <li className="icon-card">
      <div className="icon-card-title-wrap">
        {isOnline && (
          <Checkbox
            name="selected"
            checked={item.checked}
            onChange={(e) => toggleSelected(item, e.target.value)}
          />
        )}
        <div className={`icon-card-icon ${iconClass || ""}`}>
          <span>{iconLabel}</span>
        </div>
        <div className="icon-card-content">
          <ol className="breadcrumbs">
            <li className="last">
              <a href="/en-US/docs/Web">References</a>
            </li>
          </ol>
          <h2 className="icon-card-title">
            <a href={item.url}>{item.title}</a>
          </h2>
        </div>
        {isOnline && (
          <DropdownMenuWrapper
            className="dropdown is-flush-right"
            isOpen={show}
            setIsOpen={setShow}
          >
            <Button
              type="action"
              icon="ellipses"
              aria-controls="watch-card-dropdown"
              aria-haspopup={"menu"}
              aria-expanded={show || undefined}
              onClickHandler={() => {
                setShow(!show);
              }}
            />
            <DropdownMenu>
              <ul className="dropdown-list" id="watch-card-dropdown">
                <li className="dropdown-item">
                  <Button
                    type="action"
                    onClickHandler={() => onUnwatched(item)}
                  >
                    Unwatch
                  </Button>
                </li>
              </ul>
            </DropdownMenu>
          </DropdownMenuWrapper>
        )}
      </div>
      {/* <p className="icon-card-description">This is a note, lets keep it. </p> */}
    </li>
  );
}
