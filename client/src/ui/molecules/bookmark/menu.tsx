import React, { useEffect } from "react";

import { Button } from "../../atoms/button";

import "../notifications-watch-menu/index.scss";
import useSWR from "swr";
import { Icon } from "../../atoms/icon";
import { Doc } from "../../../document/types";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";

const menuId = "watch-submenu";

interface BookmarkedData {
  bookmarked?: { title: string; notes: string };
  csrfmiddlewaretoken: string;
}

export function BookmarkMenu({ doc }: { doc: Doc }) {
  const apiURL = `/api/v1/plus/bookmarks/?${new URLSearchParams({
    url: doc.mdn_url,
  }).toString()}`;
  const [show, setShow] = React.useState(false);
  const [name, setName] = React.useState(doc.title);
  const [notes, setNotes] = React.useState("");

  const { data, isValidating, mutate } = useSWR<BookmarkedData>(
    apiURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      const data = await response.json();
      return data;
    }
  );

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
      setName(doc.title);
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
    await fetch(form.action, {
      method: form.method,
      body: new URLSearchParams([...(formData as any)]),
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
      },
    });
    mutate();
    setShow(false);
  };

  const enterHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveHandler(e, (e.target as HTMLInputElement).form);
    }
  };

  const bookmarked = data?.bookmarked;

  return (
    <DropdownMenuWrapper
      className="watch-menu"
      isOpen={show}
      setIsOpen={setShow}
    >
      <Button
        type="action"
        icon={`${bookmarked ? "bookmark-filled" : "bookmark"}`}
        extraClasses={`bookmark-button small ${bookmarked ? "highlight" : ""}`}
        isDisabled={!data}
        onClickHandler={() => {
          setShow((v) => !v);
        }}
      >
        <span className="bookmark-button-label">
          {bookmarked ? "Saved" : "Save"}
        </span>
      </Button>

      {data && (
        <form method="post" action={apiURL} onSubmit={saveHandler}>
          <DropdownMenu>
            <div
              className={`${menuId} show`}
              role="menu"
              aria-labelledby={`${menuId}-button`}
            >
              <button onClick={cancelHandler} className="watch-submenu-header">
                <span className="watch-submenu-header-wrap">
                  <Icon name="chevron" />
                  {bookmarked ? "Edit" : "Save to Collection"}
                </span>
              </button>

              <div className="watch-submenu-item">
                <label htmlFor="bookmark-name">Name:</label>
                <input
                  id="bookmark-name"
                  name="name"
                  value={name}
                  autoComplete="off"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={enterHandler}
                />
              </div>
              <div className="watch-submenu-item">
                <label htmlFor="bookmark-note">Note:</label>
                <input
                  id="bookmark-note"
                  name="notes"
                  autoComplete="off"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={enterHandler}
                />
              </div>
              <div className="watch-submenu-item">
                <Button buttonType="submit" isDisabled={isValidating}>
                  Save
                </Button>
                {!data?.bookmarked ? (
                  <Button onClickHandler={cancelHandler} type="secondary">
                    Cancel
                  </Button>
                ) : (
                  <Button
                    type="action"
                    buttonType="submit"
                    name="delete"
                    value="true"
                    icon="trash"
                    isDisabled={isValidating}
                  >
                    Remove
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
