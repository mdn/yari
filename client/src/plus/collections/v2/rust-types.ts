// currently this is manually kept in sync with the types used in rumba
// eventually it would be nice to automatically export those types for use here

export interface MultipleCollectionInfo {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  article_count: number;
}

export interface MultipleCollectionCreationRequest {
  name: string;
  description?: string;
}

export interface MultipleCollectionResponse extends MultipleCollectionInfo {
  items: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  url: string;
  title: string;
  notes?: string;
  parents: CollectionParent[];
  created_at: string;
  updated_at: string;
}

export interface CollectionParent {
  uri: string;
  title: string;
}

export interface CollectionItemCreationRequest {
  title: string;
  url: string;
  notes?: string;
}

export interface LookupEntry {
  collection_id: string;
  item: CollectionItem;
}

export interface MultipleCollectionLookupQueryResponse {
  results: LookupEntry[];
}

export interface CollectionItemModificationRequest {
  title: string;
  notes?: string;
}
