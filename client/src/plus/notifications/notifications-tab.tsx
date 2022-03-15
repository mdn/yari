import { useState, useRef, useEffect } from "react";
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
import { TAB_INFO, TabVariant, FILTERS, SORTS } from "../common/tabs";

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

  const [editOptions, setEditOptions] = useState({
    starEnabled: false,
    unstarEnabled: false,
    deleteEnabled: false,
    unwatchEnabled: false,
  });

  document.title = TAB_INFO[TabVariant.NOTIFICATIONS].pageTitle || "MDN Plus";

  const { data, error, isLoading, hasMore } = useNotificationsApiEndpoint(
    offset,
    selectedTerms,
    selectedFilter,
    selectedSort,
    starred
  );
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
        ...listRef.current,
        ...data.items.map((item) => {
          return { ...item, checked: false };
        }),
      ]);
    }
  }, [data]);

  const starMany = async () => {
    const toStar = list.filter((v) => v.checked).map((i) => i.id);
    await starItemsById((data as any).csrfmiddlewaretoken, toStar);
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
    await unstarItemsById((data as any).csrfmiddlewaretoken, toUnstar);
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
      mainText: `${item.title} removed from your collection`,
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
  document.title = TAB_INFO[TabVariant.STARRED].pageTitle || "MDN Plus";

  return (
    <NotificationsTab
      starred={true}
      selectedTerms={selectedTerms}
      selectedSort={selectedSort}
      selectedFilter={selectedFilter}
    />
  );
}
