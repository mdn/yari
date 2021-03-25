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

const SESSION_STORAGE_KEY = "whoami";

export function UserDataProvider(props: { children: React.ReactNode }) {
  function sessionStorageData() {
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

  const { data } = useSWR<UserData | null, Error | null>(
    DISABLE_AUTH ? null : "/api/v1/whoami",
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        try {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } catch (error) {
          console.warn(
            "sessionStorage.removeItem didn't work",
            error.toString()
          );
        }
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
    },
    {
      initialData: sessionStorageData() || undefined,
    }
  );

  React.useEffect(() => {
    if (data !== undefined) {
      // But do you have it in sessionStorage?!
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn("sessionStorage.setItem didn't work", error.toString());
      }
    }
  }, [data]);

  return (
    <UserDataContext.Provider value={data || null}>
      {props.children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  return React.useContext(UserDataContext);
}
