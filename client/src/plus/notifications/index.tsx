import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../../hooks";
import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";

import {
  searchFiltersContext,
  SearchFiltersProvider,
} from "../contexts/search-filters";
import SearchFilter from "../search-filter";
import "./index.scss";

import { mutate } from "swr";
import { HEADER_NOTIFICATIONS_MENU_API_URL } from "../../constants";
import {
  NOTIFICATIONS_MARK_ALL_AS_READ_PATH,
  markNotificationsAsRead,
  deleteItemsById,
  undoDeleteItemById,
  deleteItemById,
  starItem,
  starItemsById,
  unstarItemsById,
  useApiEndpoint,
  unwatchItemsByUrls,
} from "./api";
import { getCookie, post } from "./utils";
import { Button } from "../../ui/atoms/button";
import { useUIStatus } from "../../ui-context";
import NotificationCardListItem from "./notification-card-list-item";
import SelectedNotificationsBar from "./notification-select";
import { Loading } from "../../ui/atoms/loading";
import { DataError, NotSignedIn } from "../common";
import { useUserData } from "../../user-context";
import WatchedCardListItem from "../icon-card";

export enum TabVariant {
  ALL,
  STARRED,
  WATCHING,
}
interface Tab {
  variant: TabVariant;
  pageTitle: string;
  label: string;
  path: string;
}

function NotificationsLayout() {
  const locale = useLocale();
  const location = useLocation();

  const { selectedTerms, getSearchFiltersParams } =
    useContext(searchFiltersContext);

  const starredUrl = `/${locale}/plus/notifications/starred`;
  const watchingUrl = `/${locale}/plus/notifications/watching`;

function useCurrentTab(locale): TabVariant {
  const location = useLocation();

  const initialTab = getInitialTab();

  const [currentTab, setTab] = useState<TabVariant>(initialTab);

  if (location.pathname === starredUrl) {
    apiUrl += "&starred=true";
    pageTitle = "My Starred Pages";
  }
  useEffect(() => {
    const clearNotificationsUrl =
      "/api/v1/plus/notifications/all/mark-as-read/";
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", getCookie("csrftoken") || "");

    // if the user clicks a hard link, we set notifications as read using a sendBeacon request
    const markNotificationsAsRead = () => {
      if (document.visibilityState === "hidden") {
        navigator.sendBeacon(clearNotificationsUrl, formData);
      }
    };
    document.addEventListener("visibilitychange", markNotificationsAsRead);

function getInitialTab() {
  if (window.location.pathname.endsWith(STARRED_URL)) {
    return TabVariant.STARRED;
  }
  if (window.location.pathname.endsWith(WATCHING_URL)) {
    return TabVariant.WATCHING;
  }
  return TabVariant.ALL;
}

function NotificationsLayout() {
  const locale = useLocale();
  const userData = useUserData();

  let watchingApiUrl = `/api/v1/plus/watched/?q=${encodeURIComponent(
    selectedTerms
  )}`;

  const watching = location.pathname === watchingUrl;

  const tabs = [
    {
      label: "All notifications",
      path: `/${locale}/plus/notifications`,
    },
    {
      label: "Starred",
      path: starredUrl,
    },
    {
      label: "Watch list",
      path: watchingUrl,
    },
  ];

  const { selectedTerms, getSearchFiltersParams } =
    useContext(searchFiltersContext);

  const currentTab = useCurrentTab(locale);

  const showTabs = userData && userData.isAuthenticated;
  const isAuthed = userData?.isAuthenticated;

  const [offset, setOffset] = useState(0);

  const { data, error, isLoading, hasMore } = useApiEndpoint(
    offset,
    selectedTerms,
    currentTab
  );

  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>Notifications</h1>
        </Container>
        <Tabs tabs={tabs} />
      </header>
      {isLoading && <Loading message="Waiting for data" />}
      {showTabs && (
        <Container>
          <>
            <NotificationsTab
              currentTab={currentTab}
              selectedTerms={selectedTerms}
              setOffset={setOffset}
              offset={offset}
              data={data}
              hasMore={hasMore}
            />
          </>
          {!userData && <Loading message="Waiting for authentication" />}
          {!userData && !isAuthed && <NotSignedIn />}
          {error && <DataError error={error} />}
        </Container>
      )}
    </>
  );
}

function NotificationsTab({
  currentTab,
  selectedTerms,
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

  //Set state for search terms change
  useEffect(() => {
    setSelectAllChecked(false);
    setOffset(0);
    setList([]);
  }, [selectedTerms, currentTab]);

  useVisibilityChangeListener();

  useEffect(() => {
    if (data && !!data.items) {
      setList([
        ...list,
        ...data.items.map((item) => {
          return { ...item, checked: false };
        }),
      ]);
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

function useVisibilityChangeListener() {
  return useEffect(() => {
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", getCookie("csrftoken") || "");
    const visibilityChangeHandler = registerSendBeaconHandler(formData);

    return () => {
      // if the user clicks a react-router Link, we remove the sendBeacon handler
      // and send a fetch request to mark notifications as read
      document.removeEventListener("visibilitychange", visibilityChangeHandler);
      markNotificationsAsRead(formData).then(async () => {
        // await mutate(apiUrl);
        await mutate(HEADER_NOTIFICATIONS_MENU_API_URL);
      });
    };
  }, []);
}

function registerSendBeaconHandler(formData: FormData) {
  formData.append("csrfmiddlewaretoken", getCookie("csrftoken") || "");
  // if the user clicks a hard link, we set notifications as read using a sendBeacon request
  const handler = () => {
    if (document.visibilityState === "hidden") {
      navigator.sendBeacon(NOTIFICATIONS_MARK_ALL_AS_READ_PATH, formData);
    }
  };
  document.addEventListener("visibilitychange", handler);
  return handler;
}

//   useEffect(() => {
//     if (data) {
//       let newTitle = `${pageTitle}`;

//       if (data.metadata.total > 0) {
//         newTitle += ` (${data.metadata.total})`;
//       }

//       if (data.metadata.page > 1) {
//         newTitle += ` Page ${data.metadata.page}`;
//       }
//       document.title = newTitle;
//     }
//   }, [data, pageTitle]);
// }

export default function Notifications() {
  return (
    <SearchFiltersProvider>
      <NotificationsLayout />
    </SearchFiltersProvider>
  );
}
