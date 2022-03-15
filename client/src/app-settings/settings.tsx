import { Switch } from "../ui/atoms/switch";
import { SettingsData, STATE, UpdateStatus } from "../app-interface";
import useInterval from "@use-it/interval";

import "./index.scss";
import { useEffect, useState } from "react";
import UpdateButton from "./update";
import ClearButton from "./clear";
import { MDN_APP_DESKTOP } from "../constants";

export default function SettingsApp({ ...appProps }) {
  return (
    <form>
      <div className="field-group">
        <section>
          <h3>Offline settings</h3>

          <Settings />
        </section>
      </div>
    </form>
  );
}

function Settings() {
  MDN_APP_DESKTOP && window.Desktop.setTitle("Settings");
  const [status, setStatus] = useState<UpdateStatus>();
  const [delay, setDelay] = useState<number | null>(
    !status || status?.state === STATE.init ? 500 : null
  );

  const [settings, setSettings] = useState<SettingsData>();

  useEffect(() => {
    const init = async () => {
      setSettings(await window.Desktop.offlineSettings());
      setStatus(await window.Desktop.updateAvailable());
      await window.Desktop.updateUser();
    };
    init();
  }, []);

  const updateSettings = async (change: SettingsData) => {
    let newSettings = await window.Desktop.setOfflineSettings(change);
    setSettings(newSettings);
  };

  useInterval(async () => {
    const next = await window.Desktop.updateStatus();
    if (next.state === STATE.nothing || next.state === STATE.updateAvailable) {
      setDelay(null);
    }
    if (
      next.progress !== status?.progress ||
      next.state !== STATE.nothing ||
      status?.state === STATE.init
    ) {
      setStatus(next);
    }
  }, delay);

  const update = () => {
    window.Desktop.update();
    setDelay(500);
    setStatus(status);
  };

  const clear = async () => {
    if (
      window.confirm("All downloaded content will be removed from your device")
    ) {
      window.Desktop.clear();
      setDelay(500);
      setStatus(status);
    }
  };

  if (settings?.autoUpdates && status?.state === STATE.updateAvailable) {
    update();
  }

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
              autoUpdates: null,
            })
          }
        ></Switch>
      </li>
      {settings?.offline && (
        <li>
          <UpdateButton updateStatus={status || null} update={update} />
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
                offline: null,
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
