import useSWR, { mutate } from "swr";
import useSWRInfinite from "swr/infinite";
import {
  MultipleCollectionInfo,
  MultipleCollectionResponse,
  MultipleCollectionCreationRequest,
  MultipleCollectionLookupQueryResponse,
  CollectionItemCreationRequest,
  CollectionItemModificationRequest,
} from "./rust-types";

export interface NewCollection {
  name: string;
  description?: string;
}

export interface Collection extends NewCollection {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface NewItem {
  collection_id: string;
  url: string;
  title: string;
  notes?: string;
}

export interface Item extends NewItem {
  id: number;
}

const COLLECTIONS_ENDPOINT = "/api/v2/collections/";

function getCollectionKey(
  id: string,
  params?: URLSearchParams | Record<string, string>
) {
  params = new URLSearchParams(params);
  if (!params.has("limit")) params.set("limit", "0");
  if (!params.has("offset")) params.set("offset", "0");
  params.sort();
  return `${COLLECTIONS_ENDPOINT}${id}/?${params}`;
}

function getItemsKey(collection_id: string) {
  return `${COLLECTIONS_ENDPOINT}${collection_id}/items/`;
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
  return useSWR<Collection[]>(
    COLLECTIONS_ENDPOINT,
    async (key: string) => await fetcher<MultipleCollectionInfo[]>(key)
  );
}

export function useCollection(id: string | undefined) {
  return useSWR<Collection>(
    id && getCollectionKey(id),
    async (key: string) => await fetcher<MultipleCollectionResponse>(key)
  );
}

export async function addCollection(
  newCollection: NewCollection
): Promise<Collection> {
  const response = await poster<MultipleCollectionCreationRequest>(
    COLLECTIONS_ENDPOINT,
    newCollection
  );
  mutate(COLLECTIONS_ENDPOINT);
  return response.json() as Promise<MultipleCollectionInfo>;
}

export async function editCollection(
  collection: Collection
): Promise<MultipleCollectionInfo> {
  const response = await poster<MultipleCollectionCreationRequest>(
    getCollectionKey(collection.id),
    collection
  );
  mutate(COLLECTIONS_ENDPOINT);
  mutate(getCollectionKey(collection.id));
  return response.json() as Promise<MultipleCollectionInfo>;
}

export async function deleteCollection(
  collection: Collection
): Promise<Response> {
  const { id } = collection;
  const response = await deleter(getCollectionKey(id));
  mutate(COLLECTIONS_ENDPOINT);
  mutate(getCollectionKey(id));
  // mutate(getBookmarkKey());
  return response;
}

export function useItems(id: string | undefined, initialSize = 1) {
  function key(page: number, previousPage: MultipleCollectionResponse) {
    if ((previousPage && !previousPage.items.length) || !id) return null;
    return getCollectionKey(id, { limit: "10", offset: `${10 * page}` });
  }

  return useSWRInfinite<Item[]>(
    key,
    async (key: string) => {
      const data = await fetcher<MultipleCollectionResponse>(key);
      return data.items.map((api_item) => ({
        ...api_item,
        collection_id: id as string,
      }));
    },
    {
      initialSize,
    }
  );
}

export function useBookmark(url: string) {
  return useSWR<Item | undefined>(getBookmarkKey(url), async (key: string) => {
    const data = await fetcher<MultipleCollectionLookupQueryResponse>(key);
    const lookupEntry = data.results[0];
    return (
      lookupEntry && {
        ...lookupEntry.item,
        collection_id: lookupEntry.collection_id.toString(),
      }
    );
  });
}

export async function addItem(item: NewItem): Promise<Response> {
  const { collection_id, ...body } = item;
  const response = await poster<CollectionItemCreationRequest>(
    getItemsKey(collection_id),
    body
  );
  mutate(getCollectionKey(collection_id));
  mutate(getBookmarkKey(body.url));
  return response;
}

export async function editItem(item: Item): Promise<Response> {
  const { collection_id, id, ...body } = item;
  const response = await poster<CollectionItemModificationRequest>(
    getItemKey(collection_id, id.toString()),
    body
  );
  mutate(getCollectionKey(collection_id));
  mutate(getBookmarkKey(body.url));
  return response;
}

export async function deleteItem(item: Item): Promise<Response> {
  const { collection_id, id, url } = item;
  const response = await deleter(getItemKey(collection_id, id.toString()));
  mutate(getCollectionKey(collection_id));
  mutate(getBookmarkKey(url));
  return response;
}
