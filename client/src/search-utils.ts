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

type Item = {
  title: string;
  url: string;
};

export function getCollectionItems(): Item[] {
  return JSON.parse(
    window?.localStorage?.getItem(COLLECTION_ITEMS_KEY) || "[]"
  );
}

function setCollectionItems(items: Item[]) {
  window?.localStorage?.setItem(COLLECTION_ITEMS_KEY, JSON.stringify(items));
}

export async function fetchAllCollectionsItems() {
  const res = await fetch("/api/v1/plus/collection/?limit=999");
  const { items = [] } = await res.json();
  setCollectionItems(
    items.map(({ title, url }) => {
      return { title, url };
    })
  );
}

export function addCollectionItem({ title, url }) {
  const items = getCollectionItems();
  items.push({
    title,
    url,
  });
  setCollectionItems(items);
}

export function removeCollectionItem({ url, title }: Item) {
  const items = getCollectionItems();
  const index = items.findIndex(
    (item) => item.url == url && item.title == title
  );
  if (index >= 0) {
    items.splice(index, 1);
  }
  setCollectionItems(items);
}
