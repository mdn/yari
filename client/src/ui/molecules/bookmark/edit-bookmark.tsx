import React, { useEffect } from "react";

import "../notifications-watch-menu/index.scss";
import { Button } from "../../atoms/button";
import { Doc } from "../../../document/types";
import { BookmarkedData } from ".";
import MDNModal from "../../atoms/modal";

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

export function EditBookmark({
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

  return (
    <>
      <Button
        type="action"
        onClickHandler={() => {
          setShow((v) => !v);
        }}
      >
        Edit
      </Button>

      {data && (
        <MDNModal
          isOpen={show}
          size="small"
          onRequestClose={() => setShow(false)}
        >
          <header className="modal-header">
            <h2 className="modal-heading">Edit</h2>
            <Button
              onClickHandler={() => setShow(false)}
              type="action"
              icon="cancel"
              extraClasses="close-button"
            />
          </header>
          <div className="modal-body">
            <form
              className="watch-submenu is-in-modal"
              method="post"
              action={apiURL}
              onSubmit={saveHandler}
            >
              <div className="watch-submenu-item border-top-0 padding-top-0">
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
              <div className="watch-submenu-item border-top-0">
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
              <div className="watch-submenu-item border-top-0 is-button-row is-always-visible">
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
                    Remove Bookmark
                  </Button>
                ) : (
                  <Button onClickHandler={cancelHandler} type="secondary">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </MDNModal>
      )}
    </>
  );
}
