import { useState, useRef, useEffect } from "react";
import { BookmarkData } from ".";
import { useUIStatus } from "../../ui-context";
import { Loading } from "../../ui/atoms/loading";
import { DataError } from "../common";
import {
  useCollectionsApiEndpoint,
  updateCollectionItem,
  updateDeleteCollectionItem,
} from "../common/api";
import { showMoreButton } from "../common/plus-tabs";
import { TabVariant, SORTS, TAB_INFO } from "../common/tabs";
import SearchFilter from "../search-filter";
import { CollectionListItem } from "./collection-list-item";

export function CollectionsTab({
  selectedTerms,
  selectedFilter,
  selectedSort,
}) {
  const [offset, setOffset] = useState(0);
  const { setToastData } = useUIStatus();
  const [list, setList] = useState<Array<any>>([]);

  document.title = TAB_INFO[TabVariant.COLLECTIONS].pageTitle || "MDN Plus";

  const { data, error, isLoading, hasMore } = useCollectionsApiEndpoint(
    offset,
    selectedTerms,
    selectedFilter,
    selectedSort
  );

  const listRef = useRef<Array<any>>([]);

  listRef.current = list;

  // Uncheck and clear list on filter change
  useEffect(() => {
    setList([]);
    setOffset(0);
  }, [selectedFilter, selectedSort, selectedTerms]);

  useEffect(() => {
    if (data && !!data.items) {
      setList([
        ...listRef.current,
        ...data.items.map((item) => {
          return { ...item, checked: false };
        }),
      ]);
    }
  }, [data]);

  const collectionsSaveHandler = async (
    e: React.FormEvent<HTMLFormElement> | React.BaseSyntheticEvent,
    item: BookmarkData
  ) => {
    let formData;
    const form = e.target as HTMLFormElement;
    formData = new FormData(form);
    await updateCollectionItem(
      item,
      new URLSearchParams([...(formData as any)]),
      data.csrfmiddlewaretoken
    );

    const newList = list.map((v) => {
      if (v.id === item.id) {
        v.title = formData.get("name") ?? v.title;
        v.notes = formData.get("notes") ?? v.notes;
      }
      return v;
    });
    setList(newList);
  };

  const deleteCollectionItem = async (item) => {
    await updateDeleteCollectionItem(item, data.csrfmiddlewaretoken, true);
    const previous = [...list];
    const listWithDelete = list.filter((v) => v.id !== item.id);
    setList(listWithDelete);
    setToastData({
      mainText: `${item.title} removed from your collection`,
      shortText: "Article removed",
      buttonText: "Undo",
      buttonHandler: async () => {
        await updateDeleteCollectionItem(item, data.csrfmiddlewaretoken, false);
        setToastData(null);
        setList(previous);
      },
    });
  };

  return (
    <>
      <SearchFilter filters={[]} sorts={SORTS} />
      {isLoading && <Loading message="Fetching your collection..." />}
      {error && <DataError error={error} />}
      <ul className="notification-list">
        <div className="icon-card-list">
          {list.map((item) => (
            <CollectionListItem
              item={item}
              onEditSubmit={collectionsSaveHandler}
              key={item.id}
              showEditButton={true}
              handleDelete={deleteCollectionItem}
            />
          ))}
        </div>
      </ul>
      {hasMore && showMoreButton(() => null, setOffset, list)}
    </>
  );
}
