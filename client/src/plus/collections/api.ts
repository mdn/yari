import { useState } from "react";
import useSWR, { KeyedMutator, mutate, SWRResponse } from "swr";
import useSWRInfinite, { SWRInfiniteResponse } from "swr/infinite";
import {
  MultipleCollectionInfo,
  MultipleCollectionResponse,
  MultipleCollectionCreationRequest,
  MultipleCollectionLookupQueryResponse,
  CollectionItemCreationRequest,
  CollectionItemModificationRequest,
} from "./rust-types";

// "swr/infinite" doesn't export InfiniteKeyedMutator directly
type InfiniteKeyedMutator<T> = SWRInfiniteResponse<
  T extends (infer I)[] ? I : T
>["mutate"];

export interface NewCollection {
  name: string;
  description?: string;
}

export interface Collection extends NewCollection {
  id: string;
  created_at: string;
  updated_at: string;
  article_count: number;
}

export interface NewItem {
  collection_id: string;
  url: string;
  title: string;
  notes?: string;
}

export interface Item extends NewItem {
  id: string;
  created_at: string;
  updated_at: string;
  parents: ItemParent[];
}

export interface FrequentlyViewedItem {
  notes?: string;
  parents: ItemParent[];
  title: string;
  url: string;
  id: number;
}

export interface ItemParent {
  uri: string;
  title: string;
}

const PAGE_SIZE = 12; // 12 is a nice composite number for our grids
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

function getCollectionPageKey(id: string | undefined, page: number) {
  if (!id || page < 0) return;
  return getCollectionKey(id, {
    limit: `${PAGE_SIZE}`,
    offset: `${PAGE_SIZE * page}`,
  });
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

function useLoading<T>(res: SWRResponse<T>) {
  return {
    ...res,
    isLoading: res.isValidating && !res.data && !res.error,
  };
}

async function fetcher<T>(key: string | undefined): Promise<T> {
  if (!key) throw Error("Invalid key");
  const response = await fetch(key);
  let data: any;
  try {
    data = await response.json();
  } catch {}
  if (!response.ok)
    throw Error(data?.message || `${response.status}: ${response.statusText}`);
  return data;
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
  let data: any;
  try {
    data = await response.json();
  } catch {}
  if (!response.ok)
    throw Error(data?.error || `${response.status}: ${response.statusText}`);
  return data || response;
}

async function deleter(key: string | undefined): Promise<Response> {
  if (!key) throw Error("Invalid key");
  const response = await fetch(key, {
    method: "DELETE",
  });
  if (!response.ok) throw Error(`${response.status}: ${response.statusText}`);
  return response;
}

function useMutation<B, R>(
  mutator: (body: B) => Promise<R>,
  success: (body: B) => void
) {
  const [error, setError] = useState<Error>();
  const [isPending, setIsPending] = useState(false);

  return {
    mutator: async (body: B) => {
      setIsPending(true);
      setError(undefined);
      try {
        const response = await mutator(body);
        success(body);
        return response;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    resetError: () => setError(undefined),
    error,
    isPending,
  };
}

export function combineMutationStatus(
  ...data: Omit<ReturnType<typeof useMutation>, "mutator">[]
) {
  return {
    resetErrors: () => {
      data.forEach((x) => x.resetError());
    },
    errors: data.map((x) => x.error).filter((x) => x !== undefined),
    isPending: data
      .map((x) => x.isPending)
      .reduce((previous, current) => previous || current, false),
  };
}

export function useCollections() {
  return useLoading(
    useSWR<Collection[]>(
      COLLECTIONS_ENDPOINT,
      async (key: string) => await fetcher<MultipleCollectionInfo[]>(key)
    )
  );
}

export function useCollection(id: string | undefined) {
  return useSWR<Collection>(
    getCollectionKey(id),
    async (key: string) => await fetcher<MultipleCollectionResponse>(key)
  );
}

export function useCollectionCreate() {
  return useMutation<NewCollection, Collection>(
    (collection) =>
      poster<MultipleCollectionCreationRequest, MultipleCollectionInfo>(
        COLLECTIONS_ENDPOINT,
        collection
      ),
    () => mutate(COLLECTIONS_ENDPOINT)
  );
}

export function useCollectionEdit() {
  return useMutation<Collection, Collection>(
    (collection) =>
      poster<MultipleCollectionCreationRequest, MultipleCollectionInfo>(
        getCollectionKey(collection.id),
        collection
      ),
    ({ id }) => {
      mutate(COLLECTIONS_ENDPOINT);
      mutate(getCollectionKey(id));
    }
  );
}

export function useCollectionDelete() {
  return useMutation<Collection, Response>(
    ({ id }) => deleter(getCollectionKey(id)),
    ({ id }) => {
      mutate(COLLECTIONS_ENDPOINT);
      mutate(getCollectionKey(id));
    }
  );
}

export function useItems(id: string | undefined, initialSize = 1) {
  function key(page: number, previousPage: Item[]) {
    if ((previousPage && !previousPage.length) || !id) return null;
    return getCollectionPageKey(id, page);
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
    isLoading:
      useData.isValidating &&
      !useData.error &&
      (!pages || pages.length !== useData.size),
  };
}

export function useBookmark(url: string) {
  return useSWR<Item[] | undefined>(
    getBookmarkKey(url),
    async (key: string) => {
      const data = await fetcher<MultipleCollectionLookupQueryResponse>(key);
      const entries = data?.results;
      return (
        entries &&
        entries.map((entry) => {
          return { ...entry.item, collection_id: entry.collection_id };
        })
      );
    }
  );
}

export function useItemAdd() {
  return useMutation<NewItem, Response>(
    ({ collection_id, ...body }) =>
      poster<CollectionItemCreationRequest>(getItemsKey(collection_id), body),
    ({ url }) => mutate(getBookmarkKey(url))
  );
}

export function useItemEdit(
  scopedMutator?: KeyedMutator<Item[][]> | InfiniteKeyedMutator<Item[][]>
) {
  return useMutation<Item, Response>(
    ({ collection_id, id, ...body }) =>
      poster<CollectionItemModificationRequest>(
        getItemKey(collection_id, id),
        body
      ),
    ({ collection_id, url }) => {
      mutate(getCollectionKey(collection_id));
      mutate(getBookmarkKey(url));
      if (scopedMutator) scopedMutator();
    }
  );
}

export function useItemDelete(
  scopedMutator?: KeyedMutator<Item[][]> | InfiniteKeyedMutator<Item[][]>
) {
  return useMutation<Item, Response>(
    ({ collection_id, id }) => deleter(getItemKey(collection_id, id)),
    ({ collection_id, url }) => {
      mutate(getCollectionKey(collection_id));
      mutate(getBookmarkKey(url));
      if (scopedMutator) scopedMutator();
    }
  );
}
