import useSWR, { mutate } from "swr";
import useSWRInfinite from "swr/infinite";

export interface NewCollection {
  name: string;
  description: string;
}

export interface Collection extends NewCollection {
  id: string;
}

export interface Item {
  collection_id: string;
  item_id: string;
  url: string;
  name: string;
  notes: string;
}

interface MultipleCollectionInfo {
  id: string;
  name: string;
  description?: string;
  // created_at: NaiveDateTime,
  // updated_at: NaiveDateTime,
  article_count: number;
}

interface MultipleCollectionCreationRequest {
  name: string;
  description?: string;
}

interface MultipleCollectionResponse extends MultipleCollectionInfo {
  items: CollectionItem[];
}

interface CollectionItem {
  id: number;
  url: string;
  title: string;
  notes?: string;
  parents: CollectionParent[];
  // created: NaiveDateTime,
}

interface CollectionParent {
  uri: string;
  title: string;
}

interface CollectionItemCreationRequest {
  name: string;
  url: string;
  notes?: string;
}

interface LookupEntry {
  collection_id: number;
  item: CollectionItem;
}

interface MultipleCollectionLookupQueryResponse {
  results: LookupEntry[] | undefined[];
}

interface CollectionItemModificationRequest {
  title: string;
  notes?: string;
}

const COLLECTIONS_ENDPOINT = "/api/v2/collections/";
const ITEMS_ENDPOINT = (id: string) => `/api/v2/collections/${id}/items/`;

function getCollectionKey(
  id: string,
  params?: URLSearchParams | Record<string, string>
) {
  params = new URLSearchParams(params);
  if (!params.has("limit")) params.set("limit", "10");
  if (!params.has("offset")) params.set("offset", "0");
  params.sort();
  return `${COLLECTIONS_ENDPOINT}${id}/?${params}`;
}

function getBookmarkKey(url: string) {
  return `${COLLECTIONS_ENDPOINT}lookup/?url=${encodeURIComponent(url)}`;
}

function getItemKey(collection_id: string, item_id: string) {
  return `${COLLECTIONS_ENDPOINT}${collection_id}/items/${item_id}/`;
}

async function fetcher<T>(key: string): Promise<T> {
  const response = await fetch(key);
  return response.json();
}

async function poster<T>(key: string, body: T) {
  return fetch(key, {
    body: JSON.stringify(body),
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  });
}

async function deleter(key: string) {
  return fetch(key, {
    method: "DELETE",
  });
}

export function useCollections() {
  return useSWR<MultipleCollectionInfo[]>(COLLECTIONS_ENDPOINT, fetcher);
}

export function useCollection(id: string | undefined) {
  return useSWR<MultipleCollectionResponse>(
    () => id && getCollectionKey(id),
    fetcher
  );
}

export async function addCollection(
  body: MultipleCollectionCreationRequest
): Promise<MultipleCollectionInfo> {
  const response = await poster(COLLECTIONS_ENDPOINT, body);
  const newCollection: MultipleCollectionInfo = await response.json();
  mutate<MultipleCollectionInfo[]>(
    COLLECTIONS_ENDPOINT,
    async (collections = []) => {
      return [...collections, newCollection];
    },
    {
      revalidate: false,
    }
  );
  return newCollection;
}

// export async function editCollection() {

// }

// export async function deleteCollection() {

// }

export function useItems(id: string | undefined, initialSize = 1) {
  function key(page: number, previousPage: MultipleCollectionResponse) {
    if ((previousPage && !previousPage.items.length) || !id) return null;
    return getCollectionKey(id, { offset: `${10 * page}` });
  }

  const returnValue = useSWRInfinite<MultipleCollectionResponse>(key, fetcher, {
    initialSize,
  });
  return {
    ...returnValue,
    data: returnValue?.data?.map(({ items }) => items).flat(1), // flatten to array of items
  };
}

export function useBookmark(url: string) {
  return useSWR(getBookmarkKey(url), async (key: string) => {
    const data = await fetcher<MultipleCollectionLookupQueryResponse>(key);
    const lookupEntry = data.results[0];
    const item: Item | undefined = lookupEntry && {
      collection_id: lookupEntry.collection_id.toString(),
      item_id: lookupEntry.item.id.toString(),
      name: lookupEntry.item.title,
      url: lookupEntry.item.url,
      notes: lookupEntry.item.notes || "",
    };
    return item;
  });
}

export async function addItem(item: Item): Promise<Response> {
  const { collection_id, ...body } = item;
  const response = await poster<CollectionItemCreationRequest>(
    ITEMS_ENDPOINT(collection_id),
    body
  );
  mutate(getCollectionKey(collection_id));
  mutate(getBookmarkKey(body.url));
  return response;
}

export async function editItem(item: Item): Promise<Response> {
  const { collection_id, item_id, ...body } = item;
  const response = await poster<CollectionItemModificationRequest>(
    getItemKey(collection_id, item_id),
    { ...body, title: body.name }
  );
  mutate(getCollectionKey(collection_id));
  mutate(getBookmarkKey(body.url));
  return response;
}

export async function deleteItem(item: Item): Promise<Response> {
  const { collection_id, item_id, url } = item;
  const response = await deleter(getItemKey(collection_id, item_id));
  mutate(getCollectionKey(collection_id));
  mutate(getBookmarkKey(url));
  return response;
}
