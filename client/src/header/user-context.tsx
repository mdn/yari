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

const UserContext = React.createContext<UserData | null | undefined>(
  defaultUserData
);

export default function UserProvider(props: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<UserData | null | undefined>(null);

  useEffect(() => {
    let dismounted = false;
    fetch("/api/v1/whoami")
      .then((response) => response.json())
      .then((data) => {
        // No point attempting to update state if the component
        // is dismounted.
        if (dismounted) {
          // bail!
          return;
        }
        let userData = {
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
        };

        // Set the userData as a state variable that we provide
        // to anyone that calls `useContext(UserProvider.context)`
        setUserData(userData);

      });
    return () => {
      dismounted = true;
    };
  }, []);

  return <UserContext.Provider value={userData}>{props.children}</UserContext.Provider>;
}

export function useUserData() {
  return useContext(UserContext)
}
