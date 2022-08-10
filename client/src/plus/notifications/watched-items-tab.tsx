import { useState, useRef, useEffect } from "react";
import LimitBanner from "../../ui/atoms/limit-banner";
import { Loading } from "../../ui/atoms/loading";
import { DataError } from "../common";
import { useWatchedItemsApiEndpoint, unwatchItemsByUrls } from "../common/api";
import { showMoreButton } from "../common/plus-tabs";
import { TabVariant, TAB_INFO } from "../common/tabs";
import WatchedCardListItem from "../icon-card";
import SearchFilter from "../search-filter";
import SelectedNotificationsBar from "./notification-select";

export function WatchedTab({ selectedTerms, selectedFilter, selectedSort }) {
  const [offset, setOffset] = useState(0);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [subscriptionLimitReached, setSubscriptionLimitReached] =
    useState(false);
  const [list, setList] = useState<Array<any>>([]);
  const listRef = useRef<Array<any>>([]);

  document.title = TAB_INFO[TabVariant.WATCHING].pageTitle;

  const { data, error, isLoading, hasMore } = useWatchedItemsApiEndpoint(
    offset,
    selectedTerms,
    selectedFilter,
    selectedSort
  );

  listRef.current = list;

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

  useEffect(() => {
    setSelectAllChecked(false);
    setList([]);
    setOffset(0);
  }, [selectedFilter, selectedSort, selectedTerms]);

  const [editOptions, setEditOptions] = useState({
    starEnabled: false,
    unstarEnabled: false,
    deleteEnabled: false,
    unwatchEnabled: false,
  });

  const calculateBulkEditOptions = (items: any[]) => {
    editOptions.starEnabled = false;
    editOptions.unstarEnabled = false;
    editOptions.deleteEnabled = false;
    editOptions.unwatchEnabled = false;

    items.forEach((val) => {
      if (val.checked) {
        !val.starred && (editOptions.starEnabled = true);
        val.starred && (editOptions.unstarEnabled = true);
        editOptions.deleteEnabled = true;
        editOptions.unwatchEnabled = true;
      }
    });
    setEditOptions({ ...editOptions });
  };

  const toggleItemChecked = (item) => {
    const newList = list.map((v) => {
      if (v.id === item.id) {
        v.checked = !v.checked;
      }
      return v;
    });
    calculateBulkEditOptions(newList);
    setList(newList);
  };
  const unwatchMany = async () => {
    const toUnWatch = list.filter((v) => v.checked);
    const res = await unwatchItemsByUrls(data.csrfmiddlewaretoken, toUnWatch);
    const limitReached =
      (await res.json())?.subscription_limit_reached || false;
    const updated = list.filter((v) => !v.checked);
    setSubscriptionLimitReached(limitReached);
    setList(updated);
  };

  const unwatchItem = async (toUnWatch) => {
    const res = await unwatchItemsByUrls(data.csrfmiddlewaretoken, [toUnWatch]);
    const limitReached =
      (await res.json())?.subscription_limit_reached || false;
    const updated = list.filter((v) => v.id !== toUnWatch.id);
    setSubscriptionLimitReached(limitReached);
    setList(updated);
  };

  return (
    <>
      <SearchFilter filters={[]} sorts={[]} />
      <SelectedNotificationsBar
        isChecked={selectAllChecked}
        onStarSelected={null}
        onSelectAll={(e) => {
          const newList = list.map((item) => {
            return { ...item, checked: e.target.checked };
          });
          setList(newList);
          setSelectAllChecked(!selectAllChecked);
          calculateBulkEditOptions(newList);
        }}
        onUnstarSelected={null}
        onDeleteSelected={null}
        buttonStates={editOptions}
        onUnwatchSelected={unwatchMany}
        watchedTab={true}
      />

      {isLoading && <Loading message="Fetching your notifications..." />}
      {error && <DataError error={error} />}
      <ul className="notification-list">
        <div className="icon-card-list">
          {!isLoading && !list.length && (
            <div className="empty-card">
              <p>You're not watching any pages.</p>{" "}
              <p>
                {" "}
                Try watching one of these pages:{" "}
                <a href="/en-US/docs/Web/CSS/overscroll-behavior">
                  <code>overscroll-behavior</code>
                </a>
                ,{" "}
                <a href="/en-US/docs/Web/API/MIDIPort">
                  <code>MIDIPort</code>
                </a>
                , or{" "}
                <a href="/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/groupBy">
                  <code>Array.prototype.groupBy()</code>
                </a>
              </p>
            </div>
          )}
          {list.map((item) => (
            <WatchedCardListItem
              onUnwatched={unwatchItem}
              item={item}
              toggleSelected={toggleItemChecked}
              key={item.id}
            />
          ))}
        </div>
      </ul>
      {subscriptionLimitReached && <LimitBanner type="watched" />}
      {hasMore && showMoreButton(setSelectAllChecked, setOffset, list)}
    </>
  );
}
