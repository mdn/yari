import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MDN_PLUS_TITLE } from "../../constants";
import { AnyFilter } from "../search-filter";

export enum TabVariant {
  COLLECTIONS,
  FREQUENTLY_VIEWED,
}

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
    if (pathname === `/${locale}${FREQUENTLY_VIEWED_URL}`) {
      setTab(TabVariant.FREQUENTLY_VIEWED);
    } else {
      setTab(TabVariant.COLLECTIONS);
    }
  }, [pathname, currentTab, locale]);

  return currentTab;
}

function getInitialTab() {
  if (window.location.pathname.endsWith(FREQUENTLY_VIEWED_URL)) {
    return TabVariant.FREQUENTLY_VIEWED;
  }
  return TabVariant.COLLECTIONS;
}
