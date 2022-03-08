import { Switch } from "../ui/atoms/switch";
import { SettingsData, STATE, UpdateStatus } from "./mdn-worker";
import useInterval from "@use-it/interval";

import "./index.scss";
import { useEffect, useState } from "react";
import UpdateButton from "./update";
import ClearButton from "./clear";

function displayEstimate({ usage = 0, quota = Infinity }: StorageEstimate) {
  const usageInMib = Math.round(usage / (1024 * 1024));

  return `${usageInMib} MiB`;
}

export default function SettingsApp({ ...appProps }) {
  return (
    <div className="field-group">
      <section>
        <h3>Offline settings</h3>

        <Settings />
      </section>
    </div>
  );
}

function Settings() {
  document.title = "MDN - Settings";
  const [status, setStatus] = useState<UpdateStatus>();

  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [settings, setSettings] = useState<SettingsData>();

  useEffect(() => {
    const init = async () => {
      setSettings(await window.mdnWorker.offlineSettings());
      setStatus(await window.mdnWorker.updateAvailable());
      setEstimate(await navigator?.storage?.estimate?.());
    };
    init().then(() => {});
  }, []);

  const updateSettings = async (change: SettingsData) => {
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

  if (settings?.autoUpdates && status?.state === STATE.updateAvailable) {
    update();
  }

  const usage = estimate && displayEstimate(estimate);

  return (
    <ul>
      <li>
        <h4>Enable offline storage</h4>
        <span>Allow MDN content to be downloaded for offline access</span>
        <Switch
          name="offline"
          checked={settings?.offline || false}
          toggle={(e) =>
            updateSettings({
              offline: e.target.checked,
            })
          }
        ></Switch>
      </li>
      {settings?.offline && (
        <li>
          <h4>Prefer online content</h4>
          <span>
            Do not use offline content while connected to the internet
          </span>
          <Switch
            name="prefer-online"
            checked={settings?.preferOnline || false}
            toggle={(e) =>
              updateSettings({
                preferOnline: e.target.checked,
              })
            }
          ></Switch>
        </li>
      )}
      {settings?.offline && (
        <li>
          <UpdateButton updateStatus={status || null} update={update} />
        </li>
      )}
      {settings?.offline && window?.location.hash === "#debug" && (
        <li>
          <h4>Debug</h4>
          <span>{JSON.stringify(status, null, 2)}</span>
        </li>
      )}
      {settings?.offline && usage && (
        <li>
          <h4>Storage used</h4>
          <span>
            MDN offline currently uses <b>{usage}</b>
          </span>
        </li>
      )}
      {settings?.offline && (
        <li>
          <h4>Enable auto-update</h4>
          <span>
            Automatically download updates to content enabled for download
          </span>
          <Switch
            name="auto-update"
            checked={settings?.autoUpdates || false}
            toggle={(e) =>
              updateSettings({
                autoUpdates: e.target.checked,
              })
            }
          ></Switch>
        </li>
      )}
      {settings?.offline && (
        <li>
          <ClearButton updateStatus={status || null} clear={clear} />
        </li>
      )}
    </ul>
  );
}
