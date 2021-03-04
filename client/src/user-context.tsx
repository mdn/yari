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

const defaultUserData: UserData = {
  username: null,
  isAuthenticated: false,
  isBetaTester: false,
  isStaff: false,
  isSuperuser: false,
  avatarUrl: null,
  isSubscriber: false,
  subscriberNumber: null,
  email: null,
  waffle: {
    flags: {},
    switches: {},
    samples: {},
  },
};

const UserDataContext = React.createContext<UserData | null>(null);

export function UserDataProvider(props: { children: React.ReactNode }) {
  const { data } = useSWR<UserData | null, Error | null>(
    DISABLE_AUTH ? null : "/api/v1/whoami",
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
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

  return (
    <UserDataContext.Provider value={data ? data : defaultUserData}>
      {props.children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  return React.useContext(UserDataContext);
}
