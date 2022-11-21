const COLLECTION_ITEMS_KEY = "collection-items";
const COLLECTION_ITEMS_UPDATED_DATE_KEY = "collection-items-updated-date";

let collectionItems: CollectionItem[] | null = null;

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

export async function getCollectionItems(
  remoteUpdated?: null | Date
): Promise<CollectionItem[]> {
  remoteUpdated && (await fetchAllCollectionsItems(remoteUpdated));
  if (collectionItems) {
    return collectionItems;
  }

  let collectionItemString;
  try {
    collectionItemString = window?.localStorage?.getItem(COLLECTION_ITEMS_KEY);
  } catch (err) {
    console.warn("Unable to read collection items from localStorage", err);
  }
  collectionItems = JSON.parse(collectionItemString || "[]");
  return collectionItems || [];
}

function setCollectionItems(items: CollectionItem[]) {
  try {
    window?.localStorage?.setItem(COLLECTION_ITEMS_KEY, JSON.stringify(items));
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
    collectionItems = items;
  }
}
