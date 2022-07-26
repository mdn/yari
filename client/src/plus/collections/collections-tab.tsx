import { useState, useRef, useEffect } from "react";
import { BookmarkData } from ".";
import { useUIStatus } from "../../ui-context";
import LimitBanner from "../../ui/atoms/limit-banner";
import { Loading } from "../../ui/atoms/loading";
import { DataError } from "../common";
import {
  useCollectionsApiEndpoint,
  updateCollectionItem,
  updateDeleteCollectionItem,
} from "../common/api";
import { showMoreButton } from "../common/plus-tabs";
import { SORTS } from "../common/tabs";
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
  const [subscriptionLimitReached, setSubscriptionLimitReached] =
    useState(false);

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
      setSubscriptionLimitReached(data.subscription_limit_reached);
      setList([
        ...(data?.offset === 0 ? [] : listRef.current),
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

    // Determine if delete was clicked.
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement;

    let isDeleted = submitter.name === "delete" && submitter.value === "true";
    if (submitter) {
      formData.append(submitter.name, submitter.value);
    }

    const res = await updateCollectionItem(
      item,
      new URLSearchParams([...(formData as any)]),
      data.csrfmiddlewaretoken
    );

    const limitReached =
      (await res.json())?.subscription_limit_reached || false;
    setSubscriptionLimitReached(limitReached);

    let newList;
    if (isDeleted) {
      // Remove locally.
      newList = list.filter((v) => v.id !== item.id);
    } else {
      // Update locally.
      newList = list.map((v) => {
        if (v.id === item.id) {
          v.title = formData.get("name") ?? v.title;
          v.notes = formData.get("notes") ?? v.notes;
        }
        return v;
      });
    }
    setList(newList);
  };

  const deleteCollectionItem = async (item) => {
    const res = await updateDeleteCollectionItem(
      item,
      data.csrfmiddlewaretoken,
      true
    );
    const limitReached =
      (await res.json())?.subscription_limit_reached || false;
    const previous = [...list];
    const listWithDelete = list.filter((v) => v.id !== item.id);
    setList(listWithDelete);
    setSubscriptionLimitReached(limitReached);

    setToastData({
      mainText: "The page has been removed from your collection.",
      shortText: "Article removed",
      buttonText: "Undo",
      buttonHandler: async () => {
        const res = await updateDeleteCollectionItem(
          item,
          data.csrfmiddlewaretoken,
          false
        );
        const limitReached =
          (await res.json())?.subscription_limit_reached || false;
        setSubscriptionLimitReached(limitReached);
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
          {list.length
            ? list.map((item) => (
                <CollectionListItem
                  item={item}
                  onEditSubmit={collectionsSaveHandler}
                  key={item.id}
                  showEditButton={true}
                  handleDelete={deleteCollectionItem}
                />
              ))
            : "You don't have any saved pages in your collection."}
        </div>
      </ul>
      {subscriptionLimitReached && <LimitBanner type="collections" />}
      {hasMore && showMoreButton(() => null, setOffset, list)}
    </>
  );
}
