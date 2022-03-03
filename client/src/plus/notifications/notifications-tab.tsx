import { useEffect, useState } from "react";
import { useUIStatus } from "../../ui-context";
import { Button } from "../../ui/atoms/button";
import WatchedCardListItem from "../icon-card";
import SearchFilter from "../search-filter";
import {
  deleteItemById,
  deleteItemsById,
  starItem,
  starItemsById,
  undoDeleteItemById,
  unstarItemsById,
  unwatchItemsByUrls,
} from "./api";
import NotificationCardListItem from "./notification-card-list-item";
import SelectedNotificationsBar from "./notification-select";
import { FILTERS, SORTS, TabVariant, TAB_INFO } from "./tabs";
import { useVisibilityChangeListener } from "./utils";

export function NotificationsTab({
  currentTab,
  selectedTerms,
  selectedFilter,
  selectedSort,
  data,
  offset,
  setOffset,
  hasMore,
}) {
  const { setToastData } = useUIStatus();

  const [list, setList] = useState<Array<any>>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [editOptions, setEditOptions] = useState({
    starEnabled: false,
    unstarEnabled: false,
    deleteEnabled: false,
    unwatchEnabled: false,
  });

  // Uncheck and clear list on tab or filter change
  useEffect(() => {
    setSelectAllChecked(false);
    setList([]);
    document.title = `${TAB_INFO.get(currentTab)?.pageTitle}` || "MDN Plus";
  }, [currentTab, selectedFilter, selectedSort, , selectedTerms]);

  useVisibilityChangeListener();

  useEffect(() => {
    if (data && !!data.items) {
      setList([
        ...list,
        ...data.items.map((item) => {
          return { ...item, checked: false };
        }),
      ]);
      let unread = data.items.filter((v) => v.read === false).length;
      if (!!unread) {
        document.title = document.title + ` (${unread})`;
      }
    }
  }, [data]);

  const deleteItem = async (item) => {
    await deleteItemById(data.csrfmiddlewaretoken, item.id);
    const listWithDelete = list.filter((v) => v.id != item.id);
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

  const deleteMany = async () => {
    const toDelete = list.filter((v) => v.checked).map((i) => i.id);
    await deleteItemsById(data.csrfmiddlewaretoken, toDelete);
    const updated = list.filter((v) => !v.checked);
    setList(updated);
  };

  const toggleStarItem = async (item) => {
    await starItem(data.csrfmiddlewaretoken, item.id);
    //Local updates
    if (currentTab === TabVariant.STARRED) {
      setList([...list.filter((v) => v.id !== item.id)]);
    } else {
      const updated = list.map((v) => {
        if (v.id === item.id) {
          v.starred = !v.starred;
        }
        return v;
      });
      setList(updated);
    }
  };

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

  const unwatchItem = async (toUnWatch) => {
    await unwatchItemsByUrls(data.csrfmiddlewaretoken, [toUnWatch]);
    const updated = list.filter((v) => v.id !== toUnWatch.id);
    setList(updated);
  };
  const unwatchMany = async () => {
    const toUnWatch = list.filter((v) => v.checked);
    await unwatchItemsByUrls(data.csrfmiddlewaretoken, toUnWatch);
    const updated = list.filter((v) => !v.checked);
    setList(updated);
  };

  let cardList = list.map((item) => {
    if (currentTab !== TabVariant.WATCHING) {
      return (
        <NotificationCardListItem
          handleDelete={deleteItem}
          item={item}
          toggleSelected={toggleItemChecked}
          toggleStarred={toggleStarItem}
          key={item.id}
        />
      );
    } else {
      return (
        <WatchedCardListItem
          onUnwatched={unwatchItem}
          item={item}
          toggleSelected={toggleItemChecked}
          key={item.id}
        />
      );
    }
  });

  return (
    <>
      <SearchFilter
        filters={currentTab === TabVariant.WATCHING ? [] : FILTERS}
        sorts={currentTab === TabVariant.WATCHING ? [] : SORTS}
      />
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
        onUnwatchSelected={unwatchMany}
        watchedTab={currentTab === TabVariant.WATCHING}
      />
      <ul className="notification-list">
        {currentTab === TabVariant.WATCHING && (
          <div className="icon-card-list">{cardList}</div>
        )}
        {currentTab !== TabVariant.WATCHING && cardList}
      </ul>
      {hasMore && (
        <div className="pagination">
          <Button
            type="primary"
            onClickHandler={() => {
              setSelectAllChecked(false);
              setOffset(offset + list.length);
            }}
          >
            Show more
          </Button>
        </div>
      )}
    </>
  );
}
