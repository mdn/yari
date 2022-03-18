import React, { useEffect } from "react";

import "../notifications-watch-menu/index.scss";
import { Icon } from "../../atoms/icon";
import { Button } from "../../atoms/button";
import { Doc } from "../../../document/types";
import { BookmarkedData } from ".";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";
import { ManageOrUpgradeDialogCollections } from "../manage-upgrade-dialog";
import { useUIStatus } from "../../../ui-context";

const menuId = "watch-submenu";

export function getBookmarkApiUrl(params?: URLSearchParams) {
  let url = "/api/v1/plus/collection/";
  if (params) {
    const querystring = params.toString();
    if (querystring) {
      url += `?${querystring}`;
    }
  }
  return url;
}

export function BookmarkMenu({
  doc,
  data,
  isValidating,
  mutate,
}:
  | {
      doc: Doc;
      data?: BookmarkedData;
      isValidating: boolean;
      mutate: CallableFunction;
    }
  | {
      doc: null;
      data: BookmarkedData;
      isValidating: boolean;
      mutate: CallableFunction;
    }) {
  const apiURL = getBookmarkApiUrl(
    new URLSearchParams([["url", doc?.mdn_url || data?.bookmarked?.url || ""]])
  );
  const ui = useUIStatus();
  const [show, setShow] = React.useState(false);
  const [name, setName] = React.useState<string>(
    data?.bookmarked?.title || doc?.title || ""
  );
  const [notes, setNotes] = React.useState("");

  useEffect(() => {
    if (data?.bookmarked) {
      setName(data.bookmarked.title);
      setNotes(data.bookmarked.notes);
    }
  }, [data]);

  const cancelHandler = (e) => {
    e.preventDefault();
    if (data?.bookmarked) {
      setName(data.bookmarked.title);
      setNotes(data.bookmarked.notes);
    } else {
      setName(doc?.title || "");
      setNotes("");
    }
    setShow(false);
  };

  const saveHandler = async (
    e: React.FormEvent<HTMLFormElement> | React.BaseSyntheticEvent,
    form?: HTMLFormElement | null
  ) => {
    e.preventDefault();
    if (isValidating || !data) return;
    let formData, submitter;
    if (form) {
      formData = new FormData(form);
    } else {
      form = e.target as HTMLFormElement;
      formData = new FormData(form);
      submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
      if (submitter) {
        formData.append(submitter.name, submitter.value);
      }
    }
    const response = await fetch(form.action, {
      method: form.method,
      body: new URLSearchParams([...(formData as any)]),
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
      },
    });
    if (!response.ok) {
      const json = await response.json();
      if (json?.error === "max_subscriptions") {
        ui.setToastData({
          mainText:
            "Couldn't save article to collection - Max subscriptions reached!",
          isImportant: false,
        });
        return;
      }
      throw new Error(`${response.status}`);
    }
    mutate();
    setShow(false);
  };

  const enterHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveHandler(e, (e.target as HTMLInputElement).form);
    }
  };

  const saved = data?.bookmarked;
  const canSaveMore = !Boolean(data?.subscription_limit_reached);
  const saveIcon = saved
    ? "bookmark-filled"
    : canSaveMore
    ? "bookmark"
    : "padlock";

  return (
    <DropdownMenuWrapper
      className="watch-menu open-on-focus-within"
      isOpen={show}
      setIsOpen={setShow}
    >
      {doc ? (
        <Button
          type="action"
          icon={saveIcon}
          extraClasses={`bookmark-button small ${saved ? "highlight" : ""}`}
          isDisabled={!data}
          onClickHandler={() => {
            setShow((v) => !v);
          }}
        >
          <span className="bookmark-button-label">
            {saved ? "Saved" : "Save"}
          </span>
        </Button>
      ) : (
        <Button
          icon="edit"
          type="action"
          title="Edit"
          onClickHandler={() => {
            setShow((v) => !v);
          }}
        >
          <span className="visually-hidden">Edit bookmark</span>
        </Button>
      )}
      {!canSaveMore && !saved ? (
        <DropdownMenu>
          <ManageOrUpgradeDialogCollections setShow={setShow} />
        </DropdownMenu>
      ) : (
        <form method="post" action={apiURL} onSubmit={saveHandler}>
          <DropdownMenu>
            <div
              className={`${menuId} show`}
              role="menu"
              aria-labelledby={`${menuId}-button`}
            >
              <button
                onClick={cancelHandler}
                className="watch-submenu-header mobile-only"
              >
                <span className="watch-submenu-header-wrap">
                  <Icon name="chevron" />
                  {saved ? "Edit Collection" : "Add to Collection"}
                </span>
              </button>

              <h2 className="watch-submenu-header desktop-only">
                {saved ? "Edit Collection" : "Add to Collection"}
              </h2>

              <div className="watch-submenu-item pad-y">
                <label htmlFor="bookmark-name">Name:</label>
                <input
                  id="bookmark-name"
                  name="name"
                  value={name}
                  autoComplete="off"
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={enterHandler}
                />
              </div>
              <div className="watch-submenu-item">
                <label htmlFor="bookmark-note">Note:</label>
                <input
                  id="bookmark-note"
                  name="notes"
                  type="text"
                  autoComplete="off"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={enterHandler}
                />
              </div>
              <div className="watch-submenu-item is-button-row">
                <Button buttonType="submit" isDisabled={isValidating}>
                  Save
                </Button>
                {doc && data?.bookmarked ? (
                  <Button
                    type="secondary"
                    buttonType="submit"
                    name="delete"
                    value="true"
                    isDisabled={isValidating}
                  >
                    Remove Collection
                  </Button>
                ) : (
                  <Button onClickHandler={cancelHandler} type="secondary">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </DropdownMenu>
        </form>
      )}
    </DropdownMenuWrapper>
  );
}
