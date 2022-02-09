export enum TABS {
  TAB_BOOKMARKS,
  TAB_FREQ_VISITED,
}
export interface Breadcrumb {
  uri: string;
  title: string;
}

export interface BookmarkData {
  id: number;
  url: string;
  title: string;
  notes: string;
  parents: Breadcrumb[];
  created: string;
  visitCount?: number;
}

export interface BookmarksMetadata {
  page: number;
  total: number;
  per_page: number;
}

export interface BookmarksData {
  items: BookmarkData[];
  metadata: BookmarksMetadata;
  csrfmiddlewaretoken: string;
}
