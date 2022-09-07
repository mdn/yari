const COLLECTION_ITEMS_KEY = "collection-items";
const COLLECTION_ITEMS_UPDATED_DATE_KEY = "collection-items-updated-date";

type CollectionItem = {
  id: number;
  title: string;
  url: string;
};

function getCollectionItemsUpdatedDate(): Date | null {
  try {
    let dateString = window?.localStorage?.getItem(
      COLLECTION_ITEMS_UPDATED_DATE_KEY
    );
    if (dateString) {
      return new Date(dateString);
    }
  } catch (err) {
    console.warn(
      "Unable to read collection items update date from localStorage",
      err
    );
  }
  return null;
}

function setCollectionItemsUpdatedDate(updated: Date) {
  try {
    window?.localStorage?.setItem(
      COLLECTION_ITEMS_UPDATED_DATE_KEY,
      updated.toISOString()
    );
  } catch (err) {
    console.warn(
      "Unable to write collection items update date to localStorage",
      err
    );
  }
}

export function getCollectionItems(): CollectionItem[] {
  let collectionItemString;
  try {
    collectionItemString = window?.localStorage?.getItem(COLLECTION_ITEMS_KEY);
  } catch (err) {
    console.warn("Unable to read collection items from localStorage", err);
  }
  return JSON.parse(collectionItemString || "[]");
}

function setCollectionItems(items: CollectionItem[]) {
  try {
    window?.localStorage?.setItem(COLLECTION_ITEMS_KEY, JSON.stringify(items));
    if (Number.isFinite(window?.mdnWorker?.mutationCounter)) {
      window.mdnWorker.mutationCounter++;
    }
  } catch (err) {
    console.warn("Unable to write collection items to localStorage", err);
  }
}

export async function fetchAllCollectionsItems(remoteUpdated: null | Date) {
  const localUpdated = getCollectionItemsUpdatedDate();
  if (!localUpdated || !remoteUpdated || remoteUpdated > localUpdated) {
    const res = await fetch("/api/v1/plus/collection/?limit=999");
    const { items = [] } = await res.json();
    setCollectionItems(items);
    setCollectionItemsUpdatedDate(remoteUpdated || new Date());
  }
}

export function addCollectionItem({ id, title, url }: CollectionItem) {
  const items = getCollectionItems();
  items.push({
    id,
    title,
    url,
  });
  setCollectionItems(items);
}

export function updateCollectionItem({ id, title }: CollectionItem) {
  const items = getCollectionItems();
  const index = items.findIndex((item) => item.id === id);
  items[index].title = title;
  setCollectionItems(items);
}

export function removeCollectionItem({ id }: CollectionItem) {
  const items = getCollectionItems();
  const index = items.findIndex((item) => item.id === id);
  if (index >= 0) {
    items.splice(index, 1);
  }
  setCollectionItems(items);
}
