import { Switch } from "../ui/atoms/switch";
import { SettingsData, STATE, UpdateStatus } from "./mdn-worker";
import useInterval from "@use-it/interval";

import { useEffect, useRef, useState } from "react";
import UpdateButton from "./update";
import ClearButton from "./clear";
import { Spinner } from "../ui/atoms/spinner";
import { MDN_PLUS_TITLE } from "../constants";

function displayEstimate({ usage = 0, quota = Infinity }: StorageEstimate) {
  const usageInMib = Math.round(usage / (1024 * 1024));

  return `${usageInMib} MiB`;
}

export default function SettingsApp({ ...appProps }) {
  const serviceWorkerAvailable = window?.navigator?.serviceWorker;

  return (
    <section className="field-group">
      {/* <h3>MDN Offline</h3> */}
      {serviceWorkerAvailable ? (
        <Settings />
      ) : (
        <>
          <h4>Offline mode is unavailable </h4>{" "}
          <p>
            Please make sure that you are not using a private or incognito
            window.
          </p>
        </>
      )}
    </section>
  );
}

function Settings() {
  document.title = `MDN Offline | ${MDN_PLUS_TITLE}`;
  const [status, setStatus] = useState<UpdateStatus>();
  const [saving, setSaving] = useState<boolean>(true);

  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [settings, setSettings] = useState<SettingsData>();
  // Workaround to avoid "Error: Too many re-renders." (https://github.com/mdn/yari/pull/5744).
  const updateTriggered = useRef(false);

  useEffect(() => {
    const init = async () => {
      setSettings(await window.mdnWorker.offlineSettings());
      setStatus(await window.mdnWorker.updateAvailable());
      setEstimate(await navigator?.storage?.estimate?.());
    };
    init().then(() => {});
  }, []);
  useEffect(() => {
    const init = async () => {
      setSaving(false);
    };
    init();
  }, [settings]);

  const updateSettings = async (change: SettingsData) => {
    setSaving(true);
    let newSettings = await window.mdnWorker.setOfflineSettings(change);
    setSettings(newSettings);
  };

  useInterval(() => {
    const next = window.mdnWorker.status();
    if (next.state === STATE.nothing) {
      if (next.state !== status?.state) {
        setStatus({ ...next });
      }
    } else {
      setStatus({ ...next });
    }
  }, 500);

  const update = () => {
    window.mdnWorker.update();
    setStatus(status);
  };

  const clear = async () => {
    if (
      window.confirm("All downloaded content will be removed from your device")
    ) {
      window.mdnWorker.clear();
      setStatus(status);
    }
  };

  if (
    settings?.autoUpdates &&
    status?.state === STATE.updateAvailable &&
    !updateTriggered.current
  ) {
    update();
    updateTriggered.current = true;
  }

  const usage = estimate && displayEstimate(estimate);

  return (
    <ul>
      <li>
        <h4>Enable offline storage</h4>
        <span>Allow MDN content to be downloaded for offline access</span>
        {(saving === true && <Spinner extraClasses="loading" />) || (
          <Switch
            name="offline"
            checked={settings?.offline || false}
            toggle={(e) =>
              updateSettings({
                offline: e.target.checked,
              })
            }
          ></Switch>
        )}
      </li>
      {settings?.offline && (
        <>
          <li>
            <h4>Prefer online content</h4>
            <span>
              Do not use offline content while connected to the internet
            </span>
            {(saving === true && <Spinner extraClasses="loading" />) || (
              <Switch
                name="prefer-online"
                checked={settings?.preferOnline || false}
                toggle={(e) =>
                  updateSettings({
                    preferOnline: e.target.checked,
                  })
                }
              ></Switch>
            )}
          </li>
          <li>
            <UpdateButton
              disabled={saving}
              updateStatus={status || null}
              update={update}
            />
          </li>
          <li>
            <h4>Enable auto-update</h4>
            <span>
              Automatically download updates to content enabled for download
            </span>
            {(saving === true && <Spinner extraClasses="loading" />) || (
              <Switch
                name="auto-update"
                checked={settings?.autoUpdates || false}
                toggle={(e) =>
                  updateSettings({
                    autoUpdates: e.target.checked,
                  })
                }
              ></Switch>
            )}
          </li>
          {window?.location.hash === "#debug" && (
            <li>
              <h4>Debug</h4>
              <span>{JSON.stringify(status, null, 2)}</span>
            </li>
          )}
          {usage && (
            <li>
              <h4>Storage used</h4>
              <span>
                MDN Offline currently uses <b>{usage}</b>
              </span>
            </li>
          )}
          <li>
            <ClearButton
              disabled={saving}
              updateStatus={status || null}
              clear={clear}
            />
          </li>
        </>
      )}
    </ul>
  );
}
