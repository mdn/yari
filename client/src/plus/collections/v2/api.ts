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

const COLLECTIONS_ENDPOINT = "/api/v2/collections/";
const ITEMS_ENDPOINT = (id: string) => `/api/v2/collections/${id}/items/`;
const FAKE_ITEM_ENDPOINT = (url: string) => `/fake/item/${url}/`;

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

async function fetcher(key: string) {
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

export function useItem(url: string) {
  return useSWR(FAKE_ITEM_ENDPOINT(url), async (key: string) => {
    const collection_ids = (
      (await fetcher(COLLECTIONS_ENDPOINT)) as MultipleCollectionInfo[]
    ).map(({ id }) => id);
    const all_collections = await Promise.all(
      collection_ids.map(
        (id) =>
          fetcher(
            getCollectionKey(id) as string
          ) as Promise<MultipleCollectionResponse>
      )
    );
    const all_items = all_collections
      .map(({ id, items }) =>
        items.map(
          (item) => ({ collection_id: id, name: item.title, ...item } as Item)
        )
      )
      .flat();
    return all_items.find(({ url: item_url }) => item_url === url);
  });
}

export async function addItem(item: Item): Promise<void> {
  const { collection_id, ...body } = item;
  const response = await poster<CollectionItemCreationRequest>(
    ITEMS_ENDPOINT(collection_id),
    body
  );
  // mutate(COLLECTION_ENDPOINT(collection_id));
  mutate(FAKE_ITEM_ENDPOINT(body.url));
  return response.json();
}

export async function editItem() {}

export async function deleteItem(): Promise<void> {}
