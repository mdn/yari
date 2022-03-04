import { UPDATES_BASE_URL } from "../constants";

export enum STATE {
  init = "init",
  nothing = "nothing",
  clearing = "clearing",
  updateAvailable = "updateAvailable",
  downloading = "downloading",
  unpacking = "unpacking",
  cleaning = "cleaning",
}

export class UpdateData {
  date: Date;
  latest: string;
  updates: [string];

  constructor({ date, latest, updates }) {
    this.date = new Date(date);
    this.latest = latest;
    this.updates = updates;
  }
}

export class SettingsData {
  offline?: boolean;
  preferOnline?: boolean;
  autoUpdates?: boolean;
  currentVersion?: string | null;
  currentDate?: string | null;

  constructor() {
    this.offline = false;
    this.preferOnline = false;
    this.autoUpdates = false;
    this.currentVersion = null;
    this.currentDate = null;
  }
}

export class UpdateStatus {
  progress?: number;
  state: STATE;
  currentVersion?: string | null;
  currentDate?: string | null;
  updateVersion?: string | null;
  updateDate?: string | null;

  constructor() {
    this.progress = -1;
    this.state = STATE.init;
    this.currentVersion = null;
    this.currentDate = null;
    this.updateVersion = null;
    this.updateDate = null;
  }
}

export class MDNWorker {
  controller: ServiceWorker | null;
  updateStatus: UpdateStatus;
  settings: SettingsData;
  latestUpdate: UpdateData | null;
  updating: boolean;

  constructor() {
    this.controller = navigator.serviceWorker.controller;
    this.settings = this.offlineSettings();
    this.updateStatus = new UpdateStatus();
    //this.settings.currentVersion = "87fe3ab8a3";
    this.updateStatus.currentDate = this.settings.currentDate || null;
    this.updateStatus.currentVersion = this.settings.currentVersion || null;
    this.updating = false;
    this.latestUpdate = null;

    navigator.serviceWorker.addEventListener("message", async (event) => {
      console.log(event);
      switch (event.data.type) {
        case "updateStatus":
          console.log(event.data);
          await this.setStatus(event.data);
          break;
        default:
          console.log("unknown message");
      }
    });
  }
  update() {
    const payload = {};
    if (
      this.latestUpdate &&
      this.updateStatus.currentVersion &&
      this.latestUpdate.updates.includes(this.updateStatus.currentVersion)
    ) {
      payload["current"] = this.updateStatus.currentVersion;
    }
    if (this.latestUpdate) {
      payload["latest"] = this.latestUpdate.latest;
      payload["date"] = this.latestUpdate.date;
    }
    this.updateStatus.state = STATE.downloading;
    console.log(JSON.stringify(payload, null, 2));
    this.controller?.postMessage({ type: "update", ...payload });
  }

  async getUpdate(): Promise<UpdateData | null> {
    if (
      this.updating ||
      !(
        this.updateStatus.state === STATE.nothing ||
        this.updateStatus.state === STATE.init
      )
    ) {
      return this.latestUpdate;
    }
    let update;
    if (
      this.latestUpdate &&
      new Date(this.latestUpdate.date) > new Date(Date.now() - 86400000)
    ) {
      update = this.latestUpdate;
    } else {
      let res = await fetch(`${UPDATES_BASE_URL}/update.json`);
      update = await res.json();
    }
    console.log(update);
    this.updateStatus.updateVersion = update?.latest;
    this.updateStatus.updateDate = update?.date;
    if (this.settings.currentVersion !== update?.latest) {
      this.updateStatus.state = STATE.updateAvailable;
    } else {
      this.updateStatus.state = STATE.nothing;
    }
    this.latestUpdate = update;
    return update;
  }

  swName(onlineFirst: boolean | null | undefined = null) {
    const onlineFirstSW = onlineFirst ?? this.settings.preferOnline ?? false;
    if (onlineFirstSW) {
      return "/sw-prefer-online.js";
    } else {
      return "/sw-prefer-offline.js";
    }
  }

  async enableServiceWorker(onlineFirst: boolean | null | undefined = null) {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register(this.swName(onlineFirst), {
        scope: "/",
      });
    }
  }

  async disableServiceWorker() {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.unregister();
    }
  }

  async updateAvailable() {
    await this.getUpdate();
    return this.status();
  }
  status() {
    console.log(this.updateStatus);
    return this.updateStatus;
  }

  offlineSettings(): SettingsData {
    return (
      JSON.parse(window.localStorage.getItem("MDNSettings") || "null") ??
      new SettingsData()
    );
  }

  async setOfflineSettings(settingsData: SettingsData): Promise<SettingsData> {
    const current = this.offlineSettings();

    if (!current.offline && settingsData.offline) {
      await this.enableServiceWorker(settingsData.preferOnline);
    } else if (current.preferOnline !== settingsData.preferOnline) {
      await this.disableServiceWorker();
      await this.enableServiceWorker(settingsData.preferOnline);
    }
    if (current.offline && settingsData.offline === false) {
      await this.disableServiceWorker();
    }

    const settings = { ...current, ...settingsData };
    window.localStorage.setItem("MDNSettings", JSON.stringify(settings));
    this.settings = settings;
    return settings;
  }
  clear() {
    this.updateStatus.state = STATE.clearing;
    this.controller?.postMessage({ type: "clear" });
  }

  async setStatus(updateStatus: UpdateStatus) {
    console.log(updateStatus);
    if (typeof updateStatus.progress !== "undefined") {
      this.updateStatus.progress = updateStatus.progress;
    }
    if (typeof updateStatus.currentDate !== "undefined") {
      this.updateStatus.currentDate = updateStatus.currentDate;
    }
    if (typeof updateStatus.currentVersion !== "undefined") {
      this.updateStatus.currentVersion = updateStatus.currentVersion;
    }
    await this.setOfflineSettings({
      currentDate: this.updateStatus.currentDate,
      currentVersion: this.updateStatus.currentVersion || null,
    });
    if (updateStatus.state) {
      if (
        updateStatus.state === STATE.init &&
        this.updateStatus.state !== STATE.init
      ) {
        this.updateStatus.updateVersion = null;
        this.updateStatus.updateDate = null;
        this.updateStatus.state = updateStatus.state;
        await this.getUpdate();
      } else {
        this.updateStatus.state = updateStatus.state;
      }
    }
  }
}

declare global {
  interface Window {
    MDNWorker: MDNWorker;
  }
}

window.MDNWorker = new MDNWorker();

if (window.MDNWorker.settings.offline) {
  window.MDNWorker.enableServiceWorker(window.MDNWorker.settings.preferOnline);
}

/*
 * Legacy Android support
 */
interface External {
  setTitle: (title: string) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  settings: () => Promise<void>;
}
declare global {
  interface Window {
    Android: External;
  }
}
