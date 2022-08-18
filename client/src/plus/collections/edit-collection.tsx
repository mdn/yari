import React from "react";

import MDNModal from "../../ui/atoms/modal";
import { Button } from "../../ui/atoms/button";
import { BookmarkData } from "./types";

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
              className="mdn-form"
              method="post"
              onSubmit={async (event) => {
                event.preventDefault();
                await onEditSubmit(event, item);
                setShow(false);
              }}
            >
              <div className="mdn-form-item">
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
              <div className="mdn-form-item">
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
              <div className="mdn-form-item is-button-row">
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
