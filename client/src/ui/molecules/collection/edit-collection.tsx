// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";

import "../notifications-watch-menu/index.scss";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/modal'. Did you me... Remove this comment to see the full error message
import MDNModal from "../../atoms/modal";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/button'. Did you m... Remove this comment to see the full error message
import { Button } from "../../atoms/button";
import { BookmarkData } from "../../../plus/collections/types";

export function EditCollection({
  item,
  onEditSubmit,
}: {
  item: BookmarkData;
  onEditSubmit: CallableFunction | any;
}) {
  const [show, setShow] = React.useState(false);
  const [name, setName] = React.useState<string>(item.title);
  const [notes, setNotes] = React.useState(item.notes);

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

      {item && (
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
              onSubmit={async (event) => {
                event.preventDefault();
                await onEditSubmit(event, item);
                setShow(false);
              }}
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
                />
              </div>
              <div className="watch-submenu-item border-top-0 is-button-row is-always-visible">
                <Button buttonType="submit">Save</Button>
                <Button
                  type="secondary"
                  buttonType="submit"
                  name="delete"
                  value="true"
                >
                  Delete
                </Button>
              </div>
            </form>
          </div>
        </MDNModal>
      )}
    </>
  );
}
