const COLLECTION_ITEMS_KEY: string = "collection-items";
const COLLECTION_ITEMS_UPDATED_DATE_KEY: string =
  "collection-items-updated-date";

type CollectionItem = {
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

export function getCollectionItems(): CollectionItem[] {
  return JSON.parse(
    window?.localStorage?.getItem(COLLECTION_ITEMS_KEY) || "[]"
  );
}

function setCollectionItems(items: CollectionItem[]) {
  window?.localStorage?.setItem(COLLECTION_ITEMS_KEY, JSON.stringify(items));
  window?.mdnWorker?.mutationCounter ?? window.mdnWorker.mutationCounter++;
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
