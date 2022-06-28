import { useState, useRef, useEffect, useMemo } from "react";
import { useUIStatus } from "../../ui-context";
import {
  useNotificationsApiEndpoint,
  starItemsById,
  unstarItemsById,
  deleteItemById,
  undoDeleteItemById,
  starItem,
  deleteItemsById,
} from "../common/api";
import { showMoreButton } from "../common/plus-tabs";
import SearchFilter from "../search-filter";
import NotificationCardListItem from "./notification-card-list-item";
import SelectedNotificationsBar from "./notification-select";
import { TAB_INFO, FILTERS, SORTS, useCurrentTab } from "../common/tabs";
import { useVisibilityChangeListener } from "./utils";
import { DataError } from "../common";
import { Loading } from "../../ui/atoms/loading";
import { useLocale } from "../../hooks";

export function NotificationsTab({
  selectedTerms,
  selectedFilter,
  selectedSort,
  starred = false,
}) {
  const [offset, setOffset] = useState(0);
  const { setToastData } = useUIStatus();
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [list, setList] = useState<Array<any>>([]);
  const locale = useLocale();
  const currentTab = useCurrentTab(locale);

  const [editOptions, setEditOptions] = useState({
    starEnabled: false,
    unstarEnabled: false,
    deleteEnabled: false,
    unwatchEnabled: false,
  });

  const { data, error, isLoading, hasMore } = useNotificationsApiEndpoint(
    offset,
    selectedTerms,
    selectedFilter,
    selectedSort,
    starred
  );

  useVisibilityChangeListener();

  const unreadCount = useMemo(
    () => data?.items?.filter((v) => v.read === false).length ?? 0,
    [data]
  );

  document.title = TAB_INFO[currentTab].pageTitle;
  useEffect(() => {
    document.title =
      TAB_INFO[currentTab].pageTitle + (unreadCount ? ` (${unreadCount})` : "");
  }, [currentTab, unreadCount]);

  const listRef = useRef<Array<any>>([]);

  listRef.current = list;

  // Uncheck and clear list on filter change
  useEffect(() => {
    setSelectAllChecked(false);
    setList([]);
    setOffset(0);
  }, [selectedFilter, selectedSort, selectedTerms]);

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

  useEffect(() => {
    if (data && !!data.items) {
      setList([
        ...(data?.offset === 0 ? [] : listRef.current),
        ...data.items.map((item) => {
          return { ...item, checked: false };
        }),
      ]);
    }
  }, [data]);

  const starMany = async () => {
    const toStar = list.filter((v) => v.checked).map((i) => i.id);
    await starItemsById(data.csrfmiddlewaretoken, toStar);
    const updated = list.map((v) => {
      if (v.checked) {
        v.starred = true;
      }
      return v;
    });
    setList(updated);
  };

  const unstarMany = async () => {
    const toUnstar = list.filter((v) => v.checked).map((i) => i.id);
    await unstarItemsById(data.csrfmiddlewaretoken, toUnstar);
    const updated = list.map((v) => {
      if (v.checked) {
        v.starred = false;
      }
      return v;
    });
    setList(updated);
  };

  const deleteItem = async (item) => {
    await deleteItemById(data.csrfmiddlewaretoken, item.id);
    const listWithDelete = list.filter((v) => v.id !== item.id);
    setList(listWithDelete);
    setToastData({
      mainText: "The notification has been removed from your list.",
      shortText: "Article removed",
      buttonText: "Undo",
      buttonHandler: async () => {
        await undoDeleteItemById((data as any).csrfmiddlewaretoken, item.id);
        setToastData(null);
      },
    });
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

  const toggleStarItem = async (item) => {
    await starItem(data.csrfmiddlewaretoken, item.id);
    //Local updates
    const updated = list.map((v) => {
      if (v.id === item.id) {
        v.starred = !v.starred;
      }
      return v;
    });
    setList(updated);
  };

  const deleteMany = async () => {
    const toDelete = list.filter((v) => v.checked).map((i) => i.id);
    await deleteItemsById(data.csrfmiddlewaretoken, toDelete);
    const updated = list.filter((v) => !v.checked);
    setList(updated);
  };
  const empty_text = !starred ? (
    <>
      <p>You have no more notifications to review! ✨</p>{" "}
      <p>
        {" "}
        Want more? Try watching one of these pages to receive notifications for
        content and/or compatibility updates:{" "}
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
    </>
  ) : (
    <p>You have no starred notifications ✨</p>
  );

  return (
    <>
      <SearchFilter filters={FILTERS} sorts={SORTS} />
      <SelectedNotificationsBar
        isChecked={selectAllChecked}
        onStarSelected={starMany}
        onSelectAll={(e) => {
          const newList = list.map((item) => {
            return { ...item, checked: e.target.checked };
          });
          setList(newList);
          setSelectAllChecked(!selectAllChecked);
          calculateBulkEditOptions(newList);
        }}
        onUnstarSelected={unstarMany}
        onDeleteSelected={deleteMany}
        buttonStates={editOptions}
        onUnwatchSelected={null}
        watchedTab={false}
      />
      {isLoading && <Loading message="Waiting for data" />}
      {error && <DataError error={error} />}
      {!isLoading && !list.length && (
        <div className="empty-card">{empty_text}</div>
      )}
      <ul className="notification-list">
        <div className="icon-card-list">
          {list.map((item) => (
            <NotificationCardListItem
              handleDelete={deleteItem}
              item={item}
              toggleSelected={toggleItemChecked}
              toggleStarred={toggleStarItem}
              key={item.id}
            />
          ))}
        </div>
      </ul>
      {hasMore && showMoreButton(setSelectAllChecked, setOffset, list)}
    </>
  );
}

export function StarredNotificationsTab({
  selectedTerms,
  selectedFilter,
  selectedSort,
}) {
  return (
    <NotificationsTab
      starred={true}
      selectedTerms={selectedTerms}
      selectedSort={selectedSort}
      selectedFilter={selectedFilter}
    />
  );
}
