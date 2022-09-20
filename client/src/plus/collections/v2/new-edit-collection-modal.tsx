import React, { useState } from "react";
import { useGlean } from "../../../telemetry/glean-context";
import { Button } from "../../../ui/atoms/button";
import MDNModal from "../../../ui/atoms/modal";
import NoteCard from "../../../ui/molecules/notecards";
import { useUserData } from "../../../user-context";
import {
  Collection,
  NewCollection,
  useCollectionCreate,
  useCollectionEdit,
} from "./api";

export default function NewEditCollectionModal({
  show,
  setShow,
  onClose,
  editingCollection,
  source,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: (collection_id?: string) => void;
  editingCollection?: Collection;
  source: string;
}) {
  const defaultCollection: Collection | NewCollection = editingCollection || {
    name: "",
    description: "",
  };
  const [collection, setCollection] = useState(defaultCollection);
  const glean = useGlean();
  const userData = useUserData();
  const { mutator: edit, ...editHook } = useCollectionEdit();
  const { mutator: create, ...createHook } = useCollectionCreate();
  const { isPending, resetError, error } =
    "id" in collection ? editHook : createHook;

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCollection({ ...collection, [name]: value.trimStart() });
  };

  const cancelHandler = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (isPending) return;
    if (onClose) onClose();
    setCollection(defaultCollection);
    resetError();
    setShow(false);
  };

  const saveHandler = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    let savedCollection;
    if ("id" in collection) {
      savedCollection = await edit(collection);
    } else {
      savedCollection = await create(collection);
      glean.click({
        source,
        subscription_type: userData?.subscriptionType || "none",
      });
    }
    if (onClose) onClose(savedCollection.id);
    setCollection(editingCollection ? savedCollection : defaultCollection);
    setShow(false);
  };

  const enterHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveHandler(e);
    }
  };

  return (
    <MDNModal
      isOpen={show}
      size="small"
      onRequestClose={cancelHandler}
      extraOverlayClassName={isPending ? "wait" : ""}
    >
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
        {error && (
          <NoteCard type="error">
            <p>Error: {error.message}</p>
          </NoteCard>
        )}
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
              disabled={isPending}
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
              disabled={isPending}
            />
          </div>
          <div className="mdn-form-item is-button-row">
            <Button buttonType="submit" isDisabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              onClickHandler={cancelHandler}
              type="secondary"
              isDisabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </MDNModal>
  );
}
