import React, { useEffect, useState } from "react";

import { Button } from "../../../atoms/button";
import { Doc } from "../../../../../../libs/types/document";
import { useOnlineStatus } from "../../../../hooks";
import {
  Item,
  deleteItem,
  useCollections,
  addItem,
  useBookmark,
  editItem,
  NewItem,
} from "../../../../plus/collections/v2/api";
import NewCollectionModal from "../../../../plus/collections/v2/new-edit-collection-modal";
import { DropdownMenu, DropdownMenuWrapper } from "../../../molecules/dropdown";
import { Icon } from "../../../atoms/icon";

const menuId = "bookmark-submenu";
const addValue = "add";

export default function BookmarkV2Menu({ doc }: { doc: Doc }) {
  const { data: collections } = useCollections();
  const { data: savedItem } = useBookmark(doc.mdn_url);

  const defaultItem: NewItem = {
    url: doc.mdn_url,
    title: doc.title,
    notes: "",
    collection_id: "",
  };

  const { isOffline } = useOnlineStatus();
  const [show, setShow] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [disableAutoClose, setDisableAutoClose] = useState(false);
  const [formItem, setFormItem] = useState<Item | NewItem>(defaultItem);

  useEffect(() => {
    if (collections && formItem.collection_id === "") {
      setFormItem({ ...formItem, collection_id: collections[0].id });
    }
  }, [collections, formItem]);

  useEffect(() => {
    if (savedItem) setFormItem(savedItem);
  }, [savedItem]);

  useEffect(() => {
    if (showNewCollection === false) {
      setDisableAutoClose(false);
    }
  }, [showNewCollection]);

  const collectionChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === addValue) {
      setDisableAutoClose(true);
      setShowNewCollection(true);
    }
    changeHandler(e);
  };

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormItem({ ...formItem, [name]: value });
  };

  const cancelHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormItem(savedItem || defaultItem);
    setShow(false);
  };

  const saveHandler = async (
    e: React.FormEvent<HTMLFormElement> | React.BaseSyntheticEvent
  ) => {
    e.preventDefault();
    if (!collections) return;
    if ("id" in formItem && savedItem) {
      if (savedItem.collection_id !== formItem.collection_id) {
        await deleteItem(savedItem);
        await addItem(formItem);
      } else {
        await editItem(formItem);
      }
    } else {
      await addItem(formItem);
    }
    setShow(false);
  };

  const enterHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveHandler(e);
    }
  };

  const deleteHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!collections) return;
    if (savedItem) {
      await deleteItem(savedItem);
    }
    setFormItem(defaultItem);
    setShow(false);
  };

  return (
    <DropdownMenuWrapper
      className="watch-menu"
      isOpen={show}
      setIsOpen={setShow}
      disableAutoClose={disableAutoClose}
    >
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
      <form className="mdn-form" method="post" onSubmit={saveHandler}>
        <DropdownMenu>
          <div
            className="article-actions-submenu show"
            role="menu"
            aria-labelledby={`${menuId}-button`}
          >
            <button onClick={cancelHandler} className="header mobile-only">
              <span className="header-wrap">
                <Icon name="chevron" />
                {savedItem ? "Edit Item" : "Add to Collection"}
              </span>
            </button>

            <h2 className="header desktop-only">
              {savedItem ? "Edit Item" : "Add to Collection"}
            </h2>

            <div className="mdn-form-item">
              <label htmlFor="bookmark-collection">Collection:</label>
              <div className="select-wrap">
                <select
                  id="bookmark-collection"
                  name="collection_id"
                  value={formItem.collection_id}
                  autoComplete="off"
                  onChange={collectionChangeHandler}
                  disabled={!collections}
                >
                  {collections?.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  )) || <option>Loading...</option>}
                  <option disabled={true} role="separator">
                    ——————————
                  </option>
                  <option value={addValue}>+ New Collection</option>
                </select>
              </div>
            </div>
            <div className="mdn-form-item">
              <label htmlFor="bookmark-title">Name:</label>
              <input
                id="bookmark-title"
                name="title"
                value={formItem.title}
                autoComplete="off"
                type="text"
                onChange={changeHandler}
                onKeyDown={enterHandler}
              />
            </div>
            <div className="mdn-form-item">
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
            <div className="mdn-form-item is-button-row">
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
          </div>
        </DropdownMenu>
      </form>
      {collections && (
        <NewCollectionModal
          show={showNewCollection}
          setShow={setShowNewCollection}
          onClose={(collection_id) => {
            setDisableAutoClose(false);
            setFormItem({
              ...formItem,
              collection_id: collection_id || collections[0].id,
            });
          }}
        />
      )}
    </DropdownMenuWrapper>
  );
}
