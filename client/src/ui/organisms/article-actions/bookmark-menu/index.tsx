import useSWR from "swr";
import { Doc } from "../../../../../../libs/types/document";
import { BookmarkData } from "../../../../plus/collections";
import { useUserData } from "../../../../user-context";
import { BookmarkMenu } from "./menu";
import BookmarkV2Menu from "./menu-v2";

export interface BookmarkedData {
  bookmarked: BookmarkData;
  subscription_limit_reached: boolean;
}

export function BookmarkContainer({ doc }: { doc: Doc }) {
  const apiURL = `/api/v1/plus/collection/?${new URLSearchParams({
    url: doc.mdn_url,
  }).toString()}`;

  const userData = useUserData();

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

  return (
    <>
      {userData?.settings?.multipleCollections ? (
        <BookmarkV2Menu doc={doc} />
      ) : (
        <BookmarkMenu
          doc={doc}
          data={data}
          isValidating={isValidating}
          mutate={mutate}
        />
      )}{" "}
    </>
  );
}
