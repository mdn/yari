import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";

import { DISABLE_AUTH } from "../constants";
import { useUserData } from "../user-context";
import { useLocale } from "../hooks";

import "./index.scss";

interface UserSettings {
  csrfmiddlewaretoken: string;
  locale: string;
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
    userData && userData.isAuthenticated ? "/api/v1/settings" : null,
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
      <div className="notecard negative">
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

  if (settingsError) {
    return (
      <div className="notecard negative">
        <h3>Server error</h3>
        <p>Unable to get the current user settings from the server.</p>
        <p>
          <code>{settingsError.toString()}</code>
        </p>
        <a href={window.location.pathname}>Reload this page and try again.</a>
      </div>
    );
  }

  return (
    <div className="account-settings-panels-container">
      {settingsData &&
        settingsData.possibleLocales &&
        settingsData.possibleLocales.length && (
          <Settings
            userSettings={data}
            settingsData={settingsData}
            refreshUserSettings={() => {
              // This will "force" a new XHR request in the useUserData hook.
              mutate("/api/v1/whoami");

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
    <>
      <h2>You have not signed in</h2>
      <Link to={`/${locale}/signin?${sp.toString()}`}>
        Please sign in to continue
      </Link>
    </>
  );
}

interface ValidationErrorMessage {
  message: string;
  code: string;
}

interface ValidationError {
  [key: string]: ValidationErrorMessage[];
}
interface ValidationErrors {
  errors: ValidationError;
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

  const [sent, setSent] = React.useState(false);
  const [sendError, setSendError] = React.useState<Error | null>(null);
  const [
    validationErrors,
    setValidationErrors,
  ] = React.useState<ValidationErrors | null>(null);

  async function sendSettings() {
    const formData = new URLSearchParams();
    formData.set("locale", locale);

    const response = await fetch("/api/v1/settings", {
      method: "POST",
      headers: {
        "X-CSRFToken": userSettings.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    if (response.status === 400) {
      setValidationErrors((await response.json()) as ValidationErrors);
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

  return (
    <form
      className="settings-form"
      onSubmit={async (event) => {
        event.preventDefault();
        await sendSettings();
      }}
    >
      {validationErrors && (
        <ShowValidationErrors errors={validationErrors.errors} />
      )}

      <div className="field-group">
        <label htmlFor="id_locale" className="slab-highlight">
          Change language
        </label>

        {sent && !sendError && (
          <div className="notecard success">
            <p>Yay! Updated settings successfully saved.</p>
          </div>
        )}
        {sendError && (
          <div className="notecard negative">
            <h4>Server submission error</h4>
            <p>Something unexpected happened during server submission.</p>
            <p>
              <code>{sendError.toString()}</code>
            </p>
            <a href={window.location.pathname}>Reload page to try again.</a>
          </div>
        )}

        <select
          id="id_locale"
          name="locale"
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
        Update language
      </button>
    </form>
  );
}

function CloseAccount({ userSettings }: { userSettings: UserSettings }) {
  const navigate = useNavigate();
  const locale = useLocale();
  const [confirm, setConfirm] = React.useState(false);
  const [certain, setCertain] = React.useState(false);

  const { error: deleteError } = useSWR<null, Error | null>(
    certain ? "/api/v1/settings" : null,
    async (url: string) => {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": userSettings.csrfmiddlewaretoken,
        },
      });
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      alert("Your account has been closed and you are now signed out.");

      // This will "force" a new XHR request in the useUserData hook.
      mutate("/api/v1/whoami");

      navigate(`/${locale}/`);
      return null;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return (
    <div className="close-account">
      <h3>Close account</h3>
      <p>Delete your account and all account data.</p>

      {deleteError && (
        <div className="notecard negative">
          <h3>Server error</h3>
          <p>A server error occurred trying to close your account.</p>
          <p>
            <code>{deleteError.toString()}</code>
          </p>
          <a href={window.location.pathname}>Reload page to try again.</a>
        </div>
      )}

      {confirm ? (
        <div className="confirm-account-closure">
          <h4>Please confirm account deletion.</h4>
          <div className="button-container">
            <button
              type="button"
              className="button outline"
              onClick={() => {
                setConfirm(false);
              }}
            >
              Cancel
            </button>{" "}
            <button
              type="button"
              className="button danger"
              onClick={() => {
                setCertain(true);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="button"
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

function ShowValidationErrors({ errors }: { errors: ValidationError }) {
  return (
    <div className="notecard error">
      <h4>Validation errors</h4>
      <ul>
        {Object.entries(errors).map(([key, messages]) => {
          return (
            <li key={key}>
              <b>
                <code>{key}</code>
              </b>
              <ul>
                {messages.map((message) => {
                  return <li key={message.code}>{message.message}</li>;
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
