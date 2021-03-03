import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";

import { DISABLE_AUTH } from "../constants";
import { useUserData } from "../user-context";
import { useLocale } from "../hooks";

interface UserSettings {
  csrfmiddlewaretoken: string;
  locale: string;
}

interface SendUserSettings {
  locale?: string;
}

interface Locale {
  locale: string;
  native: string;
  English: string;
}

interface SettingsData {
  possibleLocales: Locale[];
}

export default function SettingsApp({ ...appProps }) {
  // This app is only ever loaded in the client so we can use `window`
  let settingsDataURL = window.location.pathname;
  if (!settingsDataURL.endsWith("/")) {
    settingsDataURL += "/";
  }
  settingsDataURL += "index.json";
  console.log({ settingsDataURL });

  const { data: settingsData, error: settingsError } = useSWR<SettingsData>(
    settingsDataURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      initialData: appProps.possibleLocales
        ? { possibleLocales: appProps.possibleLocales }
        : undefined,
      revalidateOnFocus: false,
    }
  );
  const userData = useUserData();

  const { data, error } = useSWR<UserSettings | null, Error | null>(
    userData ? "/api/v1/settings" : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      const data = (await response.json()) as UserSettings;
      return data;
    }
  );

  if (DISABLE_AUTH) {
    return <AuthDisabled />;
  }

  if (!userData) {
    // The XHR request hasn't finished yet so we don't know if the user is
    // signed in or not.
    return <Loading />;
  }
  if (!userData.isAuthenticated) {
    return <NotSignedIn />;
  }

  if (error) {
    return (
      <div className="notecard error">
        <h3>Server error</h3>
        <p>A server error occurred trying to get your user settings.</p>
        <p>
          <code>{error.toString()}</code>
        </p>
        <a href={window.location.pathname}>Reload this page and try again.</a>
      </div>
    );
  }

  if (!data) {
    return <Loading />;
  }

  console.log(settingsData);

  return (
    <div>
      {settingsData &&
        settingsData.possibleLocales &&
        settingsData.possibleLocales.length && (
          <Settings
            userSettings={data}
            settingsData={settingsData}
            refreshUserSettings={() => {
              mutate("/api/v1/settings");
            }}
          />
        )}
      <CloseAccount userSettings={data} />
    </div>
  );
}

function AuthDisabled() {
  return (
    <div className="notecard warning">
      <h4>Authentication disabled</h4>
      <p>Authentication and the user settings app is currently disabled.</p>
    </div>
  );
}

function Loading() {
  return <p style={{ minHeight: 200 }}>Loading...</p>;
}

function NotSignedIn() {
  const locale = useLocale();
  const sp = new URLSearchParams();
  sp.set("next", window.location.pathname);

  return (
    <div>
      <h2>You are not signed in</h2>
      <Link to={`/${locale}/signin?${sp.toString()}`}>Sign in first</Link>
    </div>
  );
}

interface ValidationError {
  error: string;
}
function Settings({
  userSettings,
  settingsData,
  refreshUserSettings,
}: {
  userSettings: UserSettings;
  settingsData: SettingsData;
  refreshUserSettings: () => void;
}) {
  const [locale, setLocale] = React.useState(userSettings.locale);

  // const [send, setSend] = React.useState<SendUserSettings | null>(null);

  // console.log("SEND", send);

  // const { data, error, isValidating } = useSWR<
  //   UserSettings | null,
  //   Error | null
  // >(send ? "/api/v1/settings" : null, async (url) => {
  //   // const formData = new FormData();
  //   // if (send) {
  //   //   Object.entries(send).map(([key, value]) => {
  //   //     formData.append(key, value);
  //   //   });
  //   // } else {
  //   //   throw new Error("Nothing to send");
  //   // }
  //   console.log("Starting XHR");

  //   const response = await fetch(url, {
  //     method: "POST",
  //     headers: {
  //       "X-CSRFToken": userSettings.csrfmiddlewaretoken,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(send),
  //   });
  //   if (!response.ok) {
  //     throw new Error(`${response.status} on ${response.url}`);
  //   }
  //   return (await response.json()) as UserSettings;
  //   // setSend(null)
  // });
  // // async function sendSettings() {
  // //   const url = '/api/v1/settings'
  // //   const response =
  // // }
  // React.useEffect(() => {
  //   if (data || error) {
  //     console.log({ data, error }, "RESETTING!");
  //     setSend(null);
  //   }
  // }, [data, error]);
  // // console.log({ data, error, isValidating });

  const [sent, setSent] = React.useState(false);
  const [sendError, setSendError] = React.useState<Error | null>(null);
  const [
    validationError,
    setValidationError,
  ] = React.useState<ValidationError | null>(null);

  async function sendSettings() {
    const formData = new URLSearchParams();
    formData.set("locale", locale);

    const response = await fetch("/api/v1/settings", {
      method: "POST",
      headers: {
        "X-CSRFToken": userSettings.csrfmiddlewaretoken,
        "Content-Type": "application/json; charset=utf-8",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        locale,
      }),
      // body: formData,
    });
    if (response.status === 400) {
      setValidationError(await response.json());
    } else if (!response.ok) {
      setSendError(new Error(`${response.status} on ${response.url}`));
    } else {
      setSent(true);
      refreshUserSettings();
    }
  }
  React.useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) {
        setSent(false);
      }
    }, 5000);
    return () => {
      mounted = false;
    };
  }, [sent]);

  console.log({ sent, sendError });

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await sendSettings();
      }}
    >
      {sent && !sendError && (
        <div className="notecard success">
          <h4>Settings update sent</h4>
          <p>Yay! Settings saved.</p>
          <button
            type="button"
            className="button"
            onClick={() => {
              setSent(false);
            }}
          >
            &close;
          </button>
        </div>
      )}
      {sendError && (
        <div className="notecard error">
          <h4>Server submission error</h4>
          <p>Something unexpected happened on the server submission.</p>
          <p>
            <code>{sendError.toString()}</code>
          </p>
          <a href={window.location.pathname}>Reload this page and try again.</a>
        </div>
      )}

      <div>
        <label htmlFor="preferredlocale">Language</label>
        <select
          value={locale}
          onChange={(event) => {
            setLocale(event.target.value);
          }}
        >
          {settingsData.possibleLocales.map((language) => {
            return (
              <option key={language.locale} value={language.locale}>
                {language.English}
              </option>
            );
          })}
        </select>
      </div>
      <button type="submit" className="button">
        Save changes
      </button>
    </form>
  );
}
// interface CSRFData {
//   csrfmiddlewaretoken: string;
// }

function CloseAccount({ userSettings }: { userSettings: UserSettings }) {
  const navigate = useNavigate();
  const locale = useLocale();
  const [confirm, setConfirm] = React.useState(false);
  const [certain, setCertain] = React.useState(false);

  // const { data: csrfData, error: csrfError } = useSWR<
  //   CSRFData | null,
  //   Error | null
  // >(
  //   confirm ? "/api/v1/csrf" : null,
  //   async (url: string) => {
  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       throw new Error(`${response.status} on ${response.url}`);
  //     }
  //     const data = (await response.json()) as CSRFData;
  //     return data;
  //   },
  //   {
  //     revalidateOnFocus: false,
  //   }
  // );
  const { error: deleteError } = useSWR<null, Error | null>(
    certain ? "/api/v1/settings" : null,
    async (url: string) => {
      // if (!csrfData) {
      //   throw new Error("csrf data not available");
      // }
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": userSettings.csrfmiddlewaretoken,
        },
      });
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      alert("Your account has been closed and you are not signed out.");
      navigate(`/${locale}/`);
      return null;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return (
    <div>
      <h3>Close account</h3>
      <p>Delete your account and all account data.</p>

      {/* {csrfError && (
        <div className="notecard warning">
          <h3>Server error</h3>
          <p>A server error occurred prepareing the close account.</p>
        </div>
      )} */}

      {deleteError && (
        <div className="notecard error">
          <h3>Server error</h3>
          <p>A server error occurred trying to close your account.</p>
          <p>
            <code>{deleteError.toString()}</code>
          </p>
          <a href={window.location.pathname}>Reload this page and try again.</a>
        </div>
      )}

      {confirm ? (
        <p>
          Are you certain you want to do this?
          <button
            type="button"
            className="button close-account cancel"
            onClick={() => {
              setConfirm(false);
            }}
          >
            Cancel
          </button>{" "}
          <button
            type="button"
            className="button close-account certain"
            onClick={() => {
              setCertain(true);
            }}
          >
            Yes
          </button>
        </p>
      ) : (
        <button
          type="button"
          className="button close-account"
          onClick={() => {
            setConfirm(true);
          }}
        >
          Close account
        </button>
      )}
    </div>
  );
}
