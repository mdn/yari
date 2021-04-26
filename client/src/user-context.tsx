import * as React from "react";
import useSWR from "swr";

import { DISABLE_AUTH } from "./constants";

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
  email: string | null | undefined;
  waffle: {
    flags: {
      [flag_name: string]: boolean;
    };
    switches: {
      [switch_name: string]: boolean;
    };
    samples: {
      [sample_name: string]: boolean;
    };
  };
};

const UserDataContext = React.createContext<UserData | null>(null);

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
      return JSON.parse(data) as UserData;
    }
  } catch (error) {
    console.warn("sessionStorage.getItem didn't work", error.toString());
    return null;
  }
}

export function removeSessionStorageData() {
  try {
    // It's safe to call .removeItem() on a key that doesn't already exist,
    // and it's pointless to first do a .hasItem() before the .removeItem()
    // because internally that's what .removeItem() already does.
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn("sessionStorage.removeItem didn't work", error.toString());
  }
}

function setSessionStorageData(data: UserData) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("sessionStorage.setItem didn't work", error.toString());
  }
}

export function UserDataProvider(props: { children: React.ReactNode }) {
  const { data } = useSWR<UserData | null, Error | null>(
    DISABLE_AUTH ? null : "/api/v1/whoami",
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        removeSessionStorageData();
        throw new Error(`${response.status} on ${response.url}`);
      }
      const data = await response.json();
      return {
        username: data.username || null,
        isAuthenticated: data.is_authenticated || false,
        isBetaTester: data.is_beta_tester || false,
        isStaff: data.is_staff || false,
        isSuperuser: data.is_super_user || false,
        avatarUrl: data.avatar_url || null,
        isSubscriber: data.is_subscriber || false,
        subscriberNumber: data.subscriber_number || null,
        email: data.email || null,
        // NOTE: if we ever decide that waffle data should
        // be re-fetched on client-side navigation, we'll
        // have to create a separate context for it.
        waffle: data.waffle,
      };
    }
  );

  React.useEffect(() => {
    if (data) {
      // At this point, the XHR request has set `data` to be an object.
      // The user is definitely signed in or not signed in.
      setSessionStorageData(data);
    }
  }, [data]);

  return (
    <UserDataContext.Provider value={data || getSessionStorageData() || null}>
      {props.children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  return React.useContext(UserDataContext);
}
