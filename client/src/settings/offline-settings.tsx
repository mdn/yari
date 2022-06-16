import { Switch } from "../ui/atoms/switch";
import { SettingsData, getMDNWorker } from "./mdn-worker";
import useInterval from "@use-it/interval";

import { useEffect, useRef, useState } from "react";
import UpdateButton from "./update";
import ClearButton from "./clear";
import { Spinner } from "../ui/atoms/spinner";
import { MDN_PLUS_TITLE } from "../constants";
import { ContentStatus, ContentStatusPhase } from "./db";

function displayEstimate({ usage = 0, quota = Infinity }: StorageEstimate) {
  const usageInMib = Math.round(usage / (1024 * 1024));

  return `${usageInMib} MiB`;
}

export default function SettingsApp({ ...appProps }) {
  const serviceWorkerAvailable = window?.navigator?.serviceWorker;

  return (
    <section className="field-group">
      <h2>MDN Offline</h2>
      {serviceWorkerAvailable ? (
        <Settings />
      ) : (
        <>
          <h3>Offline mode is unavailable </h3>{" "}
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
  const [status, setStatus] = useState<ContentStatus>();
  const [saving, setSaving] = useState<boolean>(true);

  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [settings, setSettings] = useState<SettingsData>();
  // Workaround to avoid "Error: Too many re-renders." (https://github.com/mdn/yari/pull/5744).
  const updateTriggered = useRef(false);

  useEffect(() => {
    const init = async () => {
      const mdnWorker = getMDNWorker();
      setSettings(await mdnWorker.offlineSettings());
      setEstimate(await navigator?.storage?.estimate?.());
      mdnWorker.checkForUpdate();
    };
    init().then(() => {});
  }, []);
  useEffect(() => {
    const init = async () => {
      setSaving(false);
    };
    init();
  }, [settings]);

  useEffect(() => {
    const mdnWorker = getMDNWorker();
    const isWorkerBusy = status?.phase
      ? status?.phase !== ContentStatusPhase.IDLE
      : false;
    mdnWorker.toggleKeepAlive(isWorkerBusy);

    if (isWorkerBusy) {
      // Warn when leaving page.
      const listener = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", listener);

      return () => window.removeEventListener("beforeunload", listener);
    }
  }, [status?.phase]);

  const updateSettings = async (change: SettingsData) => {
    setSaving(true);
    const mdnWorker = getMDNWorker();
    let newSettings = await mdnWorker.setOfflineSettings(change);
    setSettings(newSettings);
  };

  useInterval(async () => {
    const mdnWorker = getMDNWorker();
    const next = await mdnWorker.status();
    setStatus({ ...next });
  }, 500);

  const update = () => {
    const mdnWorker = getMDNWorker();
    mdnWorker.update();
    setStatus(status);
  };

  const clear = async () => {
    if (
      window.confirm("All downloaded content will be removed from your device")
    ) {
      const mdnWorker = getMDNWorker();
      mdnWorker.clear();
      setStatus(status);
    }
  };

  if (
    settings?.autoUpdates &&
    status?.remote?.latest !== status?.local?.version &&
    !updateTriggered.current
  ) {
    update();
    updateTriggered.current = true;
  }

  const usage = estimate && displayEstimate(estimate);

  return (
    <ul>
      <li>
        <h3>Enable offline storage</h3>
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
            <h3>Prefer online content</h3>
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
            <h3>Enable auto-update</h3>
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
              <h3>Debug</h3>
              <span style={{ fontFamily: "monospace", whiteSpace: "pre" }}>
                {JSON.stringify(status, null, 2)}
              </span>
            </li>
          )}
          {usage && (
            <li>
              <h3>Storage used</h3>
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
