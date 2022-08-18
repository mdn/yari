import React, { useEffect } from "react";

export type SearchProps = {
  id: string;
  inputValue: string;
  onChangeInputValue: (value: string) => void;
  isFocused: boolean;
  onChangeIsFocused: (isFocused: boolean) => void;
};

export function useFocusViaKeyboard(
  inputRef: React.RefObject<null | HTMLInputElement>
) {
  useEffect(() => {
    function focusOnSearchMaybe(event) {
      const input = inputRef.current;
      const keyPressed = event.key;
      const ctrlOrMetaPressed = event.ctrlKey || event.metaKey;
      const isSlash = keyPressed === "/" && !ctrlOrMetaPressed;
      const isCtrlK = keyPressed.toLowerCase() === "k" && ctrlOrMetaPressed;
      const isTextField = ["TEXTAREA", "INPUT"].includes(event.target.tagName);
      if ((isSlash || isCtrlK) && !isTextField) {
        if (input && document.activeElement !== input) {
          event.preventDefault();
          input.focus();
        }
      }
    }
    document.addEventListener("keydown", focusOnSearchMaybe);
    return () => {
      document.removeEventListener("keydown", focusOnSearchMaybe);
    };
  }, [inputRef]);
}

const COLLECTION_ITEMS_KEY: string = "collection-items";
const COLLECTION_ITEMS_UPDATED_DATE_KEY: string =
  "collection-items-updated-date";

type Item = {
  id: number;
  title: string;
  url: string;
};

function getCollectionItemsUpdatedDate(): Date | null {
  let dateString = window?.localStorage?.getItem(
    COLLECTION_ITEMS_UPDATED_DATE_KEY
  );
  if (!dateString) {
    return null;
  }
  return new Date(dateString);
}

function setCollectionItemsUpdatedDate(updated: Date) {
  window?.localStorage?.setItem(
    COLLECTION_ITEMS_UPDATED_DATE_KEY,
    updated.toISOString()
  );
}

export function getCollectionItems(): Item[] {
  return JSON.parse(
    window?.localStorage?.getItem(COLLECTION_ITEMS_KEY) || "[]"
  );
}

function setCollectionItems(items: Item[]) {
  window?.localStorage?.setItem(COLLECTION_ITEMS_KEY, JSON.stringify(items));
  window?.mdnWorker?.mutationCounter ?? window.mdnWorker.mutationCounter++;
}

export async function fetchAllCollectionsItems(remote_updated: null | Date) {
  const local_updated = getCollectionItemsUpdatedDate();
  if (!local_updated || !remote_updated || remote_updated > local_updated) {
    const res = await fetch("/api/v1/plus/collection/?limit=999");
    const { items = [] } = await res.json();
    setCollectionItems(items);
    setCollectionItemsUpdatedDate(remote_updated || new Date());
  }
}

export function addCollectionItem({ id, title, url }) {
  const items = getCollectionItems();
  items.push({
    id,
    title,
    url,
  });
  setCollectionItems(items);
}

export function updateCollectionItem({ id, title }) {
  const items = getCollectionItems();
  const index = items.findIndex((item) => item.id === id);
  items[index].title = title;
  setCollectionItems(items);
}

export function removeCollectionItem({ id }: Item) {
  const items = getCollectionItems();
  const index = items.findIndex((item) => item.id === id);
  if (index >= 0) {
    items.splice(index, 1);
  }
  setCollectionItems(items);
}
