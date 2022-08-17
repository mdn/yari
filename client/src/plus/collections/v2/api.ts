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

const PAGE_SIZE = 10;
const COLLECTIONS_ENDPOINT = "/api/v2/collections/";

function getCollectionKey(
  id: string | undefined,
  params?: URLSearchParams | Record<string, string>
) {
  if (!id) return;
  params = new URLSearchParams(params);
  if (!params.has("limit")) params.set("limit", "0");
  if (!params.has("offset")) params.set("offset", "0");
  params.sort();
  return `${COLLECTIONS_ENDPOINT}${id}/?${params}`;
}

function getItemsKey(collection_id: string | undefined) {
  return collection_id && `${COLLECTIONS_ENDPOINT}${collection_id}/items/`;
}

function getBookmarkKey(url: string | undefined) {
  return url && `${COLLECTIONS_ENDPOINT}lookup/?url=${encodeURIComponent(url)}`;
}

function getItemKey(
  collection_id: string | undefined,
  item_id: string | undefined
) {
  return (
    collection_id &&
    item_id &&
    `${COLLECTIONS_ENDPOINT}${collection_id}/items/${item_id}/`
  );
}

async function fetcher<T>(key: string | undefined): Promise<T> {
  if (!key) throw Error("Invalid key");
  const response = await fetch(key);
  if (!response.ok) throw Error(response.statusText);
  return response.json();
}

async function poster<B, R>(key: string | undefined, body: B): Promise<R>;
async function poster<B>(key: string | undefined, body: B): Promise<Response>;
async function poster(key: string | undefined, body: any): Promise<any> {
  if (!key) throw Error("Invalid key");
  const response = await fetch(key, {
    body: JSON.stringify(body),
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  });
  if (!response.ok) throw Error(response.statusText);
  try {
    return await response.json();
  } catch {
    return response;
  }
}

async function deleter(key: string | undefined) {
  if (!key) throw Error("Invalid key");
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
    getCollectionKey(id),
    async (key: string) => await fetcher<MultipleCollectionResponse>(key)
  );
}

export async function addCollection(
  collection: NewCollection
): Promise<Collection> {
  const response = await poster<
    MultipleCollectionCreationRequest,
    MultipleCollectionInfo
  >(COLLECTIONS_ENDPOINT, collection);
  mutate(COLLECTIONS_ENDPOINT);
  return response;
}

export async function editCollection(
  collection: Collection
): Promise<Collection> {
  const response = await poster<
    MultipleCollectionCreationRequest,
    MultipleCollectionInfo
  >(getCollectionKey(collection.id), collection);
  mutate(COLLECTIONS_ENDPOINT);
  mutate(getCollectionKey(collection.id));
  return response;
}

export async function deleteCollection(
  collection: Collection
): Promise<Response> {
  const { id } = collection;
  const response = await deleter(getCollectionKey(id));
  mutate(COLLECTIONS_ENDPOINT);
  mutate(getCollectionKey(id));
  // TODO: mutate(getBookmarkKey());
  return response;
}

export function useItems(id: string | undefined, initialSize = 1) {
  function key(page: number, previousPage: Item[]) {
    if ((previousPage && !previousPage.length) || !id) return null;
    return getCollectionKey(id, {
      limit: `${PAGE_SIZE}`,
      offset: `${PAGE_SIZE * page}`,
    });
  }

  const useData = useSWRInfinite<Item[]>(
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
  const pages = useData.data;
  const lastPageLength = (pages && pages[pages.length - 1]?.length) || 0;

  return {
    ...useData,
    atEnd: lastPageLength < PAGE_SIZE,
  };
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
