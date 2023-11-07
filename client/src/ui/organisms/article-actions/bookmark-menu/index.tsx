import React, { useEffect, useState } from "react";

import { Button } from "../../../atoms/button";
import { Doc, DocMetadata } from "../../../../../../libs/types/document";
import { useOnlineStatus } from "../../../../hooks";
import {
  Item,
  useCollections,
  useBookmark,
  NewItem,
  useItemAdd,
  useItemDelete,
  useItemEdit,
  combineMutationStatus,
} from "../../../../plus/collections/api";
import NewEditCollectionModal from "../../../../plus/collections/new-edit-collection-modal";
import { DropdownMenu, DropdownMenuWrapper } from "../../../molecules/dropdown";
import { Icon } from "../../../atoms/icon";
import NoteCard from "../../../molecules/notecards";
import { useGleanClick } from "../../../../telemetry/glean-context";
import { PLUS_COLLECTIONS } from "../../../../telemetry/constants";
import ExpandingTextarea from "../../../atoms/form/expanding-textarea";
import { KeyedMutator } from "swr";

import "./index.scss";
import { Overlay, useUIStatus } from "../../../../ui-context";

const addValue = "add";

export default function BookmarkMenu({
  doc,
  item,
  scopedMutator,
}: {
  doc?: Doc | DocMetadata;
  item?: Item;
  scopedMutator?: KeyedMutator<Item[][]>;
}) {
  const [show, setShow] = useState(false);
  const [disableAutoClose, setDisableAutoClose] = useState(false);
  const { isOffline } = useOnlineStatus();
  const [saved, setSaved] = useState(false);
  const gleanClick = useGleanClick();
  const { toggleMobileOverlay } = useUIStatus();

  useEffect(() => {
    if (item) setSaved(true);
  }, [item]);

  useEffect(() => {
    toggleMobileOverlay(Overlay.BookmarkMenu, show);
  }, [show, toggleMobileOverlay]);

  return (
    <DropdownMenuWrapper
      className="bookmark-menu"
      isOpen={show}
      setIsOpen={setShow}
      disableAutoClose={disableAutoClose}
    >
      <Button
        type="action"
        isDisabled={isOffline || !doc}
        icon={saved ? "bookmark-filled" : "bookmark"}
        extraClasses={`bookmark-button small ${saved ? "highlight" : ""}`}
        onClickHandler={() => {
          setShow((v) => !v);
          if (!show) {
            gleanClick(PLUS_COLLECTIONS.ARTICLE_ACTIONS_OPENED);
          }
        }}
      >
        <span className="bookmark-button-label">
          {saved ? "Saved" : "Save"}
        </span>
      </Button>
      {doc && (
        <BookmarkMenuDropdown
          doc={doc}
          setShow={setShow}
          setSaved={setSaved}
          setDisableAutoClose={setDisableAutoClose}
          item={item}
          scopedMutator={scopedMutator}
        />
      )}
    </DropdownMenuWrapper>
  );
}

function BookmarkMenuDropdown({
  doc,
  setShow,
  setSaved,
  setDisableAutoClose,
  item,
  scopedMutator,
}: {
  doc: Doc | DocMetadata;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
  setDisableAutoClose: React.Dispatch<React.SetStateAction<boolean>>;
  item?: Item;
  scopedMutator?: KeyedMutator<Item[][]>;
}) {
  const { data: collections } = useCollections();
  const { data: savedItems } = useBookmark(doc.mdn_url);

  const defaultItem: NewItem = {
    url: doc.mdn_url,
    title: doc.title,
    notes: "",
    collection_id: "",
  };

  const [showNewCollection, setShowNewCollection] = useState(false);
  const [focusEventTriggered, setFocusEventTriggered] = useState(false);

  const [formItem, setFormItem] = useState<Item | NewItem>(defaultItem);
  const [lastAction, setLastAction] = useState("");
  const gleanClick = useGleanClick();
  const { mutator: addItem, ...addStatus } = useItemAdd();
  const { mutator: editItem, ...editStatus } = useItemEdit(scopedMutator);
  const { mutator: deleteItem, ...deleteStatus } = useItemDelete(scopedMutator);
  const { resetErrors, errors, isPending } = combineMutationStatus(
    addStatus,
    editStatus,
    deleteStatus
  );

  useEffect(() => {
    if (collections && formItem.collection_id === "") {
      setFormItem({ ...formItem, collection_id: collections[0].id });
    }
  }, [collections, formItem]);

  useEffect(() => {
    if (item) setFormItem(item);
    else if (savedItems?.length) {
      setFormItem(savedItems[0]);
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [item, savedItems, setSaved]);

  useEffect(() => {
    if (showNewCollection === false) {
      setDisableAutoClose(false);
    }
  }, [showNewCollection, setDisableAutoClose]);

  const collectionChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === addValue) {
      gleanClick(PLUS_COLLECTIONS.ARTICLE_ACTIONS_NEW);
      setDisableAutoClose(true);
      setShowNewCollection(true);
      changeHandler(e);
    } else {
      const item = savedItems?.find((item) => item.collection_id === value);
      const previousItem = savedItems?.find(
        (item) => item.collection_id === formItem.collection_id
      );
      const modifiedNotes =
        savedItems && previousItem?.notes !== formItem.notes;
      const modifiedTitle =
        savedItems && previousItem?.title !== formItem.title;
      setFormItem(
        item || {
          ...defaultItem,
          collection_id: value,
          notes: modifiedNotes ? formItem.notes : defaultItem.notes,
          title: modifiedTitle ? formItem.title : defaultItem.title,
        }
      );
    }
  };

  const changeHandler = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormItem({ ...formItem, [name]: value });
  };

  const cancelHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormItem(item || savedItems?.[0] || defaultItem);
    setShow(false);
  };

  const isCurrentInCollection = () =>
    savedItems?.length &&
    savedItems.some((item) => item.collection_id === formItem.collection_id);

  const saveHandler = async (
    e: React.FormEvent<HTMLFormElement> | React.BaseSyntheticEvent
  ) => {
    e.preventDefault();
    if (!collections || isPending) return;
    setLastAction("save");
    resetErrors();
    if ("id" in formItem && isCurrentInCollection()) {
      await editItem(formItem);
    } else {
      await addItem(formItem);
    }
    setShow(false);
  };

  const deleteHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!collections || isPending) return;
    setLastAction("delete");
    resetErrors();
    if (isCurrentInCollection()) {
      const selectedItem = savedItems?.find(
        (item) => item.collection_id === formItem.collection_id
      );
      if (selectedItem) {
        await deleteItem(selectedItem);
      }
    }
    setFormItem(defaultItem);
    setShow(false);
  };

  return (
    <>
      <form className="mdn-form" method="post" onSubmit={saveHandler}>
        <DropdownMenu>
          <div
            className={`article-actions-submenu show ${
              isPending ? "wait" : ""
            }`}
            role="menu"
          >
            <button
              onClick={cancelHandler}
              type="button"
              className="header mobile-only"
            >
              <span className="header-inner">
                <Icon name="chevron" />
                {savedItems?.length ? "Edit Item" : "Add to Collection"}
              </span>
            </button>

            <h2 className="header desktop-only">
              {savedItems?.length ? "Edit Item" : "Add to Collection"}
            </h2>

            {Boolean(errors.length) && (
              <NoteCard type="error">
                <p>Error: {errors[0]?.message}</p>
              </NoteCard>
            )}

            <div className="mdn-form-item">
              <label htmlFor="bookmark-collection">Collection:</label>
              <div className="select-wrap">
                <select
                  id="bookmark-collection"
                  name="collection_id"
                  value={formItem.collection_id}
                  autoComplete="off"
                  onChange={collectionChangeHandler}
                  onFocus={() => {
                    if (!focusEventTriggered) {
                      gleanClick(
                        PLUS_COLLECTIONS.ARTICLE_ACTIONS_SELECT_OPENED
                      );
                      setFocusEventTriggered(true);
                    }
                  }}
                  disabled={!collections || isPending}
                >
                  {collections?.map((collection) => (
                    /** Todo remove hard coded name post Migration */
                    <option key={collection.id} value={collection.id}>
                      {savedItems?.some(
                        (item) => item.collection_id === collection.id
                      )
                        ? "★"
                        : "☆"}{" "}
                      {collection.name === "Default"
                        ? "Saved Articles"
                        : collection.name}
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
                required={true}
                disabled={isPending}
              />
            </div>
            <div className="mdn-form-item">
              <label htmlFor="bookmark-note">Note:</label>
              <ExpandingTextarea
                id="bookmark-note"
                name="notes"
                autoComplete="off"
                value={formItem.notes}
                onChange={changeHandler}
                disabled={isPending}
              />
            </div>
            <div className="mdn-form-item is-button-row">
              <Button
                buttonType="submit"
                isDisabled={!collections || isPending}
              >
                {isPending && lastAction === "save" ? "Saving..." : "Save"}
              </Button>
              <Button
                onClickHandler={cancelHandler}
                isDisabled={!collections || isPending}
                type="secondary"
              >
                Cancel
              </Button>
              {Boolean(savedItems?.length) && (
                <Button
                  id="bookmark-delete"
                  type="action"
                  icon="trash"
                  onClickHandler={deleteHandler}
                  isDisabled={
                    !collections || isPending || !isCurrentInCollection()
                  }
                >
                  <span className="visually-hidden">
                    {isPending && lastAction === "delete"
                      ? "Deleting..."
                      : "Delete"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </DropdownMenu>
      </form>
      {collections && (
        <NewEditCollectionModal
          show={showNewCollection}
          setShow={setShowNewCollection}
          onClose={(collection_id) => {
            setDisableAutoClose(false);
            setFormItem({
              ...formItem,
              collection_id: collection_id || collections[0].id,
            });
          }}
          source={PLUS_COLLECTIONS.NEW_MODAL_SUBMIT_ARTICLE_ACTIONS}
        />
      )}
    </>
  );
}
