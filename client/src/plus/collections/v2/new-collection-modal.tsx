import React, { useState } from "react";
import { Button } from "../../../ui/atoms/button";
import MDNModal from "../../../ui/atoms/modal";
import { Collection, createCollection, NewCollection } from "./api";

export default function NewCollectionModal({
  show,
  setShow,
  collections,
  setCollections,
  onClose,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  collections: Collection[];
  setCollections:
    | React.Dispatch<React.SetStateAction<Collection[]>>
    | React.Dispatch<React.SetStateAction<Collection[] | undefined>>;
  onClose?: (collection_id?: string) => void;
}) {
  const [collection, setCollection] = useState<NewCollection>({
    title: "",
    description: "",
  });

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCollection({ ...collection, [name]: value.trimStart() });
  };

  const cancelHandler = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (onClose) onClose();
    setCollection({ title: "", description: "" });
    setShow(false);
  };

  const saveHandler = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const createdCollection = await createCollection(collection);
    setCollections([...collections, createdCollection]);
    if (onClose) onClose(createdCollection.id);
    setCollection({ title: "", description: "" });
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
        <h2 className="modal-heading">Create Collection</h2>
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
            <label htmlFor="collection-title">Title:</label>
            <input
              id="collection-title"
              name="title"
              value={collection.title}
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
            <Button buttonType="submit">Create Collection</Button>
            <Button onClickHandler={cancelHandler} type="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </MDNModal>
  );
}
