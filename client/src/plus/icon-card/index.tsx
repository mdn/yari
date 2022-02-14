import React from "react";

import { mutate } from "swr";
import { Button } from "../../ui/atoms/button";
import { post } from "../notifications/utils";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { docCategory } from "../../utils";

import "./index.scss";

function _getIconLabel(url) {
  let category = docCategory({ pathname: url });

  if (category) {
    category = category?.split("-")[1];

    if (category === "javascript") {
      return "js";
    }

    if (category === "accessibility") {
      return "acc";
    }
    return category;
  }

  return "docs";
}

export default function IconCard({ item, changedCallback, csrfToken }) {
  const deleteUrl = `/api/v1/plus/watch${item.url}`;
  const [show, setShow] = React.useState(false);

  const iconClass = docCategory({ pathname: item.url })?.split("-")[1];
  const iconLabel = _getIconLabel(item.url);

  return (
    <article className="icon-card">
      <div className="icon-card-title-wrap">
        <div className={`icon-card-icon ${iconClass || ""}`}>{iconLabel}</div>
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
      </div>
      {/* <p className="icon-card-description">This is a note, lets keep it. </p> */}
    </article>
  );
}
