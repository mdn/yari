import useSWR from "swr";
import { Doc } from "../../../document/types";
import { BookmarkData } from "../../../plus/bookmarks";
import { BookmarkMenu } from "./menu";

export interface BookmarkedData {
  bookmarked?: BookmarkData;
  csrfmiddlewaretoken: string;
}

export function BookmarkContainer({ doc }: { doc: Doc }) {
  const apiURL = `/api/v1/plus/collection/?${new URLSearchParams({
    url: doc.mdn_url,
  }).toString()}`;
  const { data, isValidating, mutate } = useSWR<BookmarkedData>(
    apiURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      const data = await response.json();
      return data;
    }
  );

  return BookmarkMenu({ doc, data, isValidating, mutate });
}
