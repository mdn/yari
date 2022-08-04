import React, { useEffect, useState } from "react";

import "../notifications-watch-menu/index.scss";
import { Button } from "../../atoms/button";
import { Doc } from "../../../document/types";
import { useOnlineStatus } from "../../../hooks";
import MDNModal from "../../atoms/modal";
import {
  Item,
  Collection,
  deleteItem,
  getItem,
  getCollections,
  saveItem,
} from "../../../plus/collections/v2/api";
import NewCollectionModal from "../../../plus/collections/v2/new-collection-modal";

export default function BookmarkV2Menu({ doc }: { doc: Doc }) {
  const defaultItem: Item = {
    url: doc.mdn_url,
    name: doc.title,
    notes: "",
    collection_id: "",
  };

  const { isOffline } = useOnlineStatus();
  const [show, setShow] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [savedItem, setSavedItem] = useState<Item>();
  const [formItem, setFormItem] = useState(defaultItem);
  const [collections, setCollections] = useState<Collection[]>();

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  useEffect(() => {
    getItem(doc).then(setSavedItem);
  }, [doc]);

  useEffect(() => {
    if (savedItem) setFormItem(savedItem);
  }, [savedItem]);

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormItem({ ...formItem, [name]: value });
  };

  const cancelHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormItem(savedItem || defaultItem);
    setShow(false);
  };

  const toItem = (formData: FormData) => {
    return {
      url: doc.mdn_url,
      name: formData.get("name") as string,
      notes: formData.get("notes") as string,
      collection_id: formData.get("collection") as string,
    };
  };

  const saveHandler = async (
    e: React.FormEvent<HTMLFormElement> | React.BaseSyntheticEvent,
    form?: HTMLFormElement | null
  ) => {
    e.preventDefault();
    if (!collections) return;
    const formData = new FormData(form || (e.target as HTMLFormElement));
    const newItem = toItem(formData);
    await saveItem(newItem);
    setSavedItem(newItem);
    setShow(false);
  };

  const enterHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveHandler(e, (e.target as HTMLInputElement).form);
    }
  };

  const deleteHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!collections) return;
    const formData = new FormData(
      (e.target as HTMLInputElement).form || undefined
    );
    await deleteItem(toItem(formData));
    setFormItem(savedItem || defaultItem);
    setShow(false);
  };

  return (
    <>
      {doc ? (
        <Button
          type="action"
          isDisabled={isOffline}
          icon={savedItem ? "bookmark-filled" : "bookmark"}
          extraClasses={`bookmark-button small ${savedItem ? "highlight" : ""}`}
          onClickHandler={() => {
            setShow((v) => !v);
          }}
        >
          <span className="bookmark-button-label">
            {savedItem ? "Saved" : "Save"}
          </span>
        </Button>
      ) : (
        <Button
          icon="edit"
          type="action"
          isDisabled={isOffline}
          title="Edit"
          onClickHandler={() => {
            setShow((v) => !v);
          }}
        >
          <span className="visually-hidden">Edit bookmark</span>
        </Button>
      )}
      <MDNModal
        isOpen={show}
        size="small"
        onRequestClose={() => setShow(false)}
      >
        <header className="modal-header">
          <h2 className="modal-heading">
            {savedItem ? "Edit Item" : "Save to Collection"}
          </h2>
          <Button
            onClickHandler={() => setShow(false)}
            type="action"
            icon="cancel"
            extraClasses="close-button"
          />
        </header>
        <div className="modal-body">
          <form method="post" onSubmit={saveHandler}>
            <div className="watch-submenu-item border-top-0 padding-top-0">
              <label htmlFor="bookmark-collection">Collection:</label>
              <select
                id="bookmark-collection"
                name="collection"
                value={formItem.collection_id}
                autoComplete="off"
                onChange={changeHandler}
                disabled={!collections}
              >
                {collections?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                )) || <option value="">Loading...</option>}
              </select>
              <Button
                type="action"
                onClickHandler={() => setShowNewCollection(true)}
                isDisabled={!collections}
              >
                New collection
              </Button>
            </div>
            <div className="watch-submenu-item border-top-0 padding-top-0">
              <label htmlFor="bookmark-name">Name:</label>
              <input
                id="bookmark-name"
                name="name"
                value={formItem.name}
                autoComplete="off"
                type="text"
                onChange={changeHandler}
                onKeyDown={enterHandler}
              />
            </div>
            <div className="watch-submenu-item border-top-0 padding-top-0">
              <label htmlFor="bookmark-note">Note:</label>
              <input
                id="bookmark-note"
                name="notes"
                type="text"
                autoComplete="off"
                value={formItem.notes}
                onChange={changeHandler}
                onKeyDown={enterHandler}
              />
            </div>
            <div className="watch-submenu-item border-top-0 is-button-row is-always-visible">
              <Button buttonType="submit" isDisabled={!collections}>
                Save
              </Button>
              {savedItem ? (
                <Button
                  type="secondary"
                  onClickHandler={deleteHandler}
                  isDisabled={!collections}
                >
                  Delete
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
      {collections && (
        <NewCollectionModal
          show={showNewCollection}
          setShow={setShowNewCollection}
          callback={(collection_id) =>
            setFormItem({ ...formItem, collection_id })
          }
          {...{ collections, setCollections }}
        />
      )}
    </>
  );
}
