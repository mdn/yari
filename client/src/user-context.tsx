import * as React from "react";
import useSWR from "swr";

import { DISABLE_AUTH, DEFAULT_GEO_COUNTRY } from "./env";
import { FREQUENTLY_VIEWED_STORAGE_KEY } from "./plus/collections/frequently-viewed";

const DEPRECATED_LOCAL_STORAGE_KEYS = [
  "collection-items",
  "collection-items-updated-date",
];

export const OFFLINE_SETTINGS_KEY = "MDNSettings";

export enum SubscriptionType {
  MDN_CORE = "core",
  MDN_PLUS_5M = "mdn_plus_5m",
  MDN_PLUS_5Y = "mdn_plus_5y",
  MDN_PLUS_10M = "mdn_plus_10m",
  MDN_PLUS_10Y = "mdn_plus_10y",
}

export type UserPlusSettings = {
  collectionLastModified: Date | null;
  mdnplusNewsletter: boolean | null;
  noAds: boolean | null;
};

export class OfflineSettingsData {
  offline: boolean;
  preferOnline: boolean;
  autoUpdates: boolean;

  constructor({
    offline = false,
    preferOnline = false,
    autoUpdates = false,
  } = {}) {
    this.offline = offline;
    this.preferOnline = preferOnline;
    this.autoUpdates = autoUpdates;
  }

  static read(): OfflineSettingsData {
    let settingsData: OfflineSettingsData | undefined;
    try {
      settingsData = JSON.parse(
        window.localStorage.getItem(OFFLINE_SETTINGS_KEY) || "{}"
      );
    } catch (err) {
      console.warn("Unable to read settings from localStorage", err);
    }

    return new OfflineSettingsData(settingsData);
  }

  write() {
    try {
      window.localStorage.setItem(OFFLINE_SETTINGS_KEY, JSON.stringify(this));
    } catch (err) {
      console.warn("Unable to write settings to localStorage", err);
    }
  }
}

export type UserData = {
  username: string | null | undefined;
  isAuthenticated: boolean;
  isBetaTester: boolean;
  isContributor?: boolean; // This is not implemented on backend yet
  isStaff: boolean;
  isSuperuser: boolean;
  avatarUrl: string | null | undefined;
  isSubscriber: boolean;
  subscriberNumber: number | null | undefined;
  subscriptionType: SubscriptionType | null;
  email: string | null | undefined;
  geo: {
    country: string;
  };
  maintenance?: string;
  settings: null | UserPlusSettings;
  offlineSettings: null | OfflineSettingsData;
  mutate: () => void;
};

export const UserDataContext = React.createContext<UserData | null>(null);

// The argument for using sessionStorage rather than localStorage is because
// it's marginally simpler and "safer". For example, if we use localStorage
// it might stick in the browser for a very long time and we might change
// the structure of that JSON we store in there.
// Also, localStorage doesn't go away. So if we decide to not do this stuff
// anymore we won't have users who have that stuff stuck in their browser
// "forever".
const SESSION_STORAGE_KEY = "whoami";

function getSessionStorageData() {
  try {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Because it was added late, if the stored value doesn't contain
      // then following keys, consider the stored data stale.
      if (!parsed.geo) {
        // If we don't do this check, you might be returning stored data
        // that doesn't match any of the new keys.
        return false;
      }
      return parsed as UserData;
    }
  } catch (error: any) {
    console.warn("sessionStorage.getItem didn't work", error.toString());
    return null;
  }
}

export function cleanupUserData() {
  removeSessionStorageData();
  removeLocalStorageData(FREQUENTLY_VIEWED_STORAGE_KEY);
  if (window.mdnWorker) {
    window.mdnWorker.cleanDb();
    window.mdnWorker.disableServiceWorker();
  }
}

function removeSessionStorageData() {
  try {
    // It's safe to call .removeItem() on a key that doesn't already exist,
    // and it's pointless to first do a .hasItem() before the .removeItem()
    // because internally that's what .removeItem() already does.
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error: any) {
    console.warn("sessionStorage.removeItem didn't work", error.toString());
  }
}

function removeLocalStorageData(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Unable to delete ${key} from localStorage`, e);
  }
}

function removeDeprecatedLocalStorageData() {
  for (const key of DEPRECATED_LOCAL_STORAGE_KEYS) {
    removeLocalStorageData(key);
  }
}

function setSessionStorageData(data: UserData) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch (error: any) {
    console.warn("sessionStorage.setItem didn't work", error.toString());
  }
}

export function UserDataProvider(props: { children: React.ReactNode }) {
  const { data, mutate } = useSWR<UserData | null, Error | null>(
    DISABLE_AUTH ? null : "/api/v1/whoami",
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        removeSessionStorageData();
        throw new Error(`${response.status} on ${response.url}`);
      }
      const data = await response.json();
      const collectionLastModified =
        data?.settings?.collections_last_modified_time;
      const settings: UserPlusSettings | null = data?.settings
        ? {
            collectionLastModified:
              (collectionLastModified && new Date(collectionLastModified)) ||
              null,
            mdnplusNewsletter: data?.settings?.mdnplus_newsletter || null,
            noAds: data?.settings?.no_ads || null,
          }
        : null;

      return {
        username: data.username || null,
        isAuthenticated: data.is_authenticated || false,
        isBetaTester: data.is_beta_tester || false,
        isStaff: data.is_staff || false,
        isSuperuser: data.is_super_user || false,
        avatarUrl: data.avatar_url || null,
        isSubscriber: data.is_subscriber || false,
        subscriptionType:
          data.subscription_type === "core"
            ? SubscriptionType.MDN_CORE
            : data.subscription_type ?? null,
        subscriberNumber: data.subscriber_number || null,
        email: data.email || null,
        geo: {
          country: (data.geo && data.geo.country) || DEFAULT_GEO_COUNTRY,
        },
        maintenance: data.maintenance,
        settings,
        offlineSettings: null,
        mutate,
      };
    }
  );

  React.useEffect(() => {
    removeDeprecatedLocalStorageData();
  }, []);

  React.useEffect(() => {
    if (data) {
      // At this point, the XHR request has set `data` to be an object.
      // The user is definitely signed in or not signed in.
      data.offlineSettings = OfflineSettingsData.read();
      setSessionStorageData(data);

      // Let's initialize the MDN Worker if applicable.
      if (!window.mdnWorker && data?.offlineSettings?.offline) {
        import("./settings/mdn-worker").then(({ getMDNWorker }) => {
          const mdnWorker = getMDNWorker();
          if (data?.isSubscriber === false) {
            mdnWorker.clearOfflineSettings();
            mdnWorker.disableServiceWorker();
            data.offlineSettings = new OfflineSettingsData();
          }
        });
      } else if (window.mdnWorker) {
        if (data?.isSubscriber === false) {
          window.mdnWorker.clearOfflineSettings();
          data.offlineSettings = new OfflineSettingsData();
        }
        if (!data?.offlineSettings?.offline) {
          window.mdnWorker.disableServiceWorker();
        }
      }
    }
  }, [data]);

  let userData = data || getSessionStorageData();

  return (
    <UserDataContext.Provider value={userData || null}>
      {props.children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  return React.useContext(UserDataContext);
}
