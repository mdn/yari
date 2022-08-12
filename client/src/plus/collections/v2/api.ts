import { Doc } from "../../../../../libs/types/document";

export interface NewCollection {
  title: string;
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

export async function createCollection(
  collection: NewCollection
): Promise<Collection> {
  const collections: Array<Collection> = JSON.parse(
    window.localStorage.getItem("collections") || "[]"
  );
  const fullCollection = { ...collection, id: window.crypto.randomUUID() };
  collections.push(fullCollection);
  window.localStorage.setItem("collections", JSON.stringify(collections));
  return fullCollection;
}

export async function getCollections(): Promise<Array<Collection>> {
  const collections: Collection[] = JSON.parse(
    window.localStorage.getItem("collections") || "[]"
  );
  if (collections.length === 0) {
    collections.push({ id: "default", title: "Default", description: "" });
  }
  return collections;
}

export async function getCollection(
  id: string | undefined
): Promise<Collection | undefined> {
  if (!id) throw Error;
  return (
    JSON.parse(
      window.localStorage.getItem("collections") || "[]"
    ) as Collection[]
  ).find((c) => c.id === id);
}

export async function getItem(doc: Doc): Promise<Item | undefined> {
  return (
    JSON.parse(window.localStorage.getItem("items") || "[]") as Item[]
  ).find((b) => b.url === doc.mdn_url);
}

export async function saveItem(item: Item): Promise<void> {
  const other_items = (
    JSON.parse(window.localStorage.getItem("items") || "[]") as Item[]
  ).filter((b) => b.url !== item.url);
  window.localStorage.setItem("items", JSON.stringify([...other_items, item]));
}

export async function deleteItem(item: Item): Promise<void> {
  const items = (
    JSON.parse(window.localStorage.getItem("items") || "[]") as Item[]
  ).filter((b) => b.url !== item.url);
  window.localStorage.setItem("items", JSON.stringify(items));
}

export async function getItems(collection: Collection): Promise<Item[]> {
  return (
    JSON.parse(window.localStorage.getItem("items") || "[]") as Item[]
  ).filter((b) => b.collection_id === collection.id);
}
