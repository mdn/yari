import React, { useState } from "react";
import { Button } from "../../../ui/atoms/button";
import MDNModal from "../../../ui/atoms/modal";
import {
  Collection,
  createCollection,
  NewCollection,
  editCollection,
} from "./api";

export default function NewEditCollectionModal({
  show,
  setShow,
  onClose,
  editingCollection,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: (collection_id?: string) => void;
  editingCollection?: Collection;
}) {
  const defaultCollection: Collection | NewCollection = editingCollection || {
    name: "",
    description: "",
  };
  const [collection, setCollection] = useState(defaultCollection);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCollection({ ...collection, [name]: value.trimStart() });
  };

  const cancelHandler = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (onClose) onClose();
    setCollection(defaultCollection);
    setShow(false);
  };

  const saveHandler = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const savedCollection =
      "id" in collection
        ? await editCollection(collection)
        : await createCollection(collection);
    if (onClose) onClose(savedCollection.id);
    setCollection(defaultCollection);
    setShow(false);
  };

  const enterHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveHandler(e);
    }
  };

  return (
    <MDNModal isOpen={show} size="small" onRequestClose={cancelHandler}>
      <header className="modal-header">
        <h2 className="modal-heading">
          {editingCollection ? "Edit Collection" : "Create Collection"}
        </h2>
        <Button
          onClickHandler={cancelHandler}
          type="action"
          icon="cancel"
          extraClasses="close-button"
        />
      </header>
      <div className="modal-body">
        <form className="mdn-form" onSubmit={saveHandler}>
          <div className="mdn-form-item">
            <label htmlFor="collection-name">Name:</label>
            <input
              id="collection-name"
              name="name"
              value={collection.name}
              onChange={changeHandler}
              onKeyDown={enterHandler}
              autoComplete="off"
              type="text"
              required={true}
            />
          </div>
          <div className="mdn-form-item">
            <label htmlFor="collection-description">Description:</label>
            <input
              id="collection-description"
              name="description"
              value={collection.description}
              onChange={changeHandler}
              onKeyDown={enterHandler}
              autoComplete="off"
              type="text"
            />
          </div>
          <div className="mdn-form-item is-button-row">
            <Button buttonType="submit">Save</Button>
            <Button onClickHandler={cancelHandler} type="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </MDNModal>
  );
}
