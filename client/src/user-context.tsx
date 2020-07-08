import * as React from "react";
import { useContext, useEffect, useState } from "react";

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
  wikiContributions: number | null | undefined;
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
  wikiContributions: 0,
  waffle: {
    flags: {},
    switches: {},
    samples: {},
  },
};

const UserDataContext = React.createContext<UserData | null>(defaultUserData);

export function UserDataProvider(props: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/whoami", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} on ${response.url}`);
        }
        return response.json();
      })
      .then((data) => {
        setUserData({
          username: data.username || null,
          isAuthenticated: data.is_authenticated || false,
          isBetaTester: data.is_beta_tester || false,
          isStaff: data.is_staff || false,
          isSuperuser: data.is_super_user || false,
          avatarUrl: data.avatar_url || null,
          isSubscriber: data.is_subscriber || false,
          subscriberNumber: data.subscriber_number || null,
          email: data.email || null,
          wikiContributions: data.wiki_contributions || 0,
          // NOTE: if we ever decide that waffle data should
          // be re-fetched on client-side navigation, we'll
          // have to create a separate context for it.
          waffle: data.waffle,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("error while fetching user data", error);
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <UserDataContext.Provider value={userData}>
      {props.children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  return useContext(UserDataContext);
}
