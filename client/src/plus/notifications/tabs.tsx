import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export enum TabVariant {
  ALL,
  STARRED,
  WATCHING,
}

const ALL_URL = "/plus/notifications";
const STARRED_URL = "/plus/notifications/starred";
const WATCHING_URL = "/plus/notifications/watching";

export const FILTERS = [
  {
    label: "Content updates",
    param: "content",
  },
  {
    label: "Browser compatibility",
    param: "compat",
  },
];

export const SORTS = [
  {
    label: "Date",
    param: "date",
  },
  {
    label: "Title",
    param: "title",
  },
];

export const TAB_INFO = new Map([
  [
    TabVariant.ALL,
    {
      pageTitle: "Notifications",
      label: "All notifications",
      path: ALL_URL,
    },
  ],
  [
    TabVariant.STARRED,
    {
      label: "Starred",
      pageTitle: "My Starred Pages",
      path: STARRED_URL,
    },
  ],
  [
    TabVariant.WATCHING,
    {
      label: "Watch list",
      pageTitle: "My Watched Pages",
      path: WATCHING_URL,
    },
  ],
]);

export function useCurrentTab(locale): TabVariant {
  const location = useLocation();
  const initialTab = getInitialTab();

  const [currentTab, setTab] = useState<TabVariant>(initialTab);

  useEffect(() => {
    if (location.pathname === `/${locale}${STARRED_URL}`) {
      setTab(TabVariant.STARRED);
    } else if (location.pathname === `/${locale}${WATCHING_URL}`) {
      setTab(TabVariant.WATCHING);
    } else {
      setTab(TabVariant.ALL);
    }
  }, [location, currentTab, locale]);

  return currentTab;
}

function getInitialTab() {
  if (window.location.pathname.endsWith(STARRED_URL)) {
    return TabVariant.STARRED;
  }
  if (window.location.pathname.endsWith(WATCHING_URL)) {
    return TabVariant.WATCHING;
  }
  return TabVariant.ALL;
}
