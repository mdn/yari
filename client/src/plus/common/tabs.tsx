import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MDN_PLUS_TITLE } from "../../constants";
import { AnyFilter } from "../search-filter";

export enum TabVariant {
  NOTIFICATIONS,
  STARRED,
  WATCHING,
  COLLECTIONS,
  FREQUENTLY_VIEWED,
}

const NOTIFICATIONS_URL = "/plus/notifications";
const STARRED_URL = "/plus/notifications/starred";
const WATCHING_URL = "/plus/notifications/watching";
const COLLECTIONS_URL = "/plus/collections";
const FREQUENTLY_VIEWED_URL = "/plus/collections/frequently_viewed";

export const FILTERS: AnyFilter[] = [
  {
    type: "select",
    key: "filterType",
    label: "Filters",
    options: [
      {
        label: "Content updates",
        value: "content",
      },
      {
        label: "Browser compatibility",
        value: "compat",
      },
    ],
  },
];

export const SORTS = [
  {
    label: "Date",
    param: "sort=date",
  },
  {
    label: "Title",
    param: "sort=title",
  },
];

interface TabDefinition {
  pageTitle: string;
  label: string;
  path: string;
}

export const TAB_INFO: Record<TabVariant, TabDefinition> = {
  [TabVariant.NOTIFICATIONS]: {
    pageTitle: `Notifications | ${MDN_PLUS_TITLE}`,
    label: "All notifications",
    path: NOTIFICATIONS_URL,
  },

  [TabVariant.STARRED]: {
    label: "Starred",
    pageTitle: `Starred | ${MDN_PLUS_TITLE}`,
    path: STARRED_URL,
  },
  [TabVariant.WATCHING]: {
    label: "Watch list",
    pageTitle: `Watch list | ${MDN_PLUS_TITLE}`,
    path: WATCHING_URL,
  },

  [TabVariant.COLLECTIONS]: {
    label: "Collection",
    pageTitle: `Collections | ${MDN_PLUS_TITLE}`,
    path: COLLECTIONS_URL,
  },

  [TabVariant.FREQUENTLY_VIEWED]: {
    label: "Frequently viewed articles",
    pageTitle: `Frequently viewed articles | ${MDN_PLUS_TITLE}`,
    path: FREQUENTLY_VIEWED_URL,
  },
};

export function useCurrentTab(locale): TabVariant {
  const { pathname } = useLocation();
  const initialTab = getInitialTab();

  const [currentTab, setTab] = useState<TabVariant>(initialTab);

  useEffect(() => {
    if (pathname === `/${locale}${STARRED_URL}`) {
      setTab(TabVariant.STARRED);
    } else if (pathname === `/${locale}${WATCHING_URL}`) {
      setTab(TabVariant.WATCHING);
    } else if (pathname === `/${locale}${COLLECTIONS_URL}`) {
      setTab(TabVariant.COLLECTIONS);
    } else if (pathname === `/${locale}${FREQUENTLY_VIEWED_URL}`) {
      setTab(TabVariant.FREQUENTLY_VIEWED);
    } else {
      setTab(TabVariant.NOTIFICATIONS);
    }
  }, [pathname, currentTab, locale]);

  return currentTab;
}

function getInitialTab() {
  if (window.location.pathname.endsWith(STARRED_URL)) {
    return TabVariant.STARRED;
  }
  if (window.location.pathname.endsWith(COLLECTIONS_URL)) {
    return TabVariant.COLLECTIONS;
  }
  if (window.location.pathname.endsWith(FREQUENTLY_VIEWED_URL)) {
    return TabVariant.FREQUENTLY_VIEWED;
  }
  if (window.location.pathname.endsWith(WATCHING_URL)) {
    return TabVariant.WATCHING;
  }
  return TabVariant.NOTIFICATIONS;
}
