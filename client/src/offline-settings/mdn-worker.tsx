import { UPDATES_BASE_URL } from "../constants";
import { MDNOfflineDB, UpdateMetadata } from "./db";

export enum STATE {
  init = "init",
  nothing = "nothing",
  clearing = "clearing",
  updateAvailable = "updateAvailable",
  updating = "updating",
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

interface UpdatePackageManifest {
  root: string;
  files: Array<string>;
}

interface VersionInfo {
  currentVersion?: string | null;
  updatedAt?: Date | null;
}

export class SettingsData {
  offline?: boolean;
  preferOnline?: boolean;
  autoUpdates?: boolean;

  constructor() {
    this.offline = false;
    this.preferOnline = false;
    this.autoUpdates = false;
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
  updateStatus: UpdateStatus;
  versionInfo?: VersionInfo | null;
  settings: SettingsData;
  latestUpdate: UpdateData | null;
  updating: boolean;
  registered: boolean;
  timeout?: ReturnType<typeof setTimeout> | null;
  db: MDNOfflineDB;

  constructor() {
    this.settings = this.offlineSettings();
    this.updateStatus = new UpdateStatus();
    this.updating = false;
    this.latestUpdate = null;
    this.registered = false;
    this.timeout = null;
    this.db = new MDNOfflineDB();

    if (this.settings.autoUpdates) {
      this.autoUpdate();
    }
  }

  async getVersionInfo(): Promise<VersionInfo | null> {
    return (await this.db.version_info.toCollection().first()) ?? null;
  }

  async autoUpdate() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    await this.getUpdate();
    this.update();
    this.timeout = setTimeout(() => this.autoUpdate(), 5 * 1000);
  }

  controller(): ServiceWorker | null {
    return navigator.serviceWorker.controller;
  }

  async update() {
    if (
      this.updating ||
      this.versionInfo?.currentVersion === this.latestUpdate?.latest
    ) {
      console.log(this.updateStatus);
      this.updateStatus.progress = await this.getProgress();
      return;
    }
    this.updating = true;
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
    const updateManifestResponse = await fetch(
      `${UPDATES_BASE_URL}/packages/${this.latestUpdate?.latest}-content/index.json`
    );
    const manifest: UpdatePackageManifest = await updateManifestResponse.json();
    this.updateStatus.state = STATE.updating;
    await this.registerUpdate(manifest);
    await manifest.files.map(async (file) => {
      payload["filename"] = file;
      await this.controller()?.postMessage({
        type: "update",
        ...payload,
      });
    });
  }

  async registerUpdate(manifest: UpdatePackageManifest) {
    const update: Array<UpdateMetadata> = manifest.files.map((file) => {
      return {
        root: manifest.root,
        filename: file,
        completed: null,
        error: false,
      };
    });
    this.db.update_progress.bulkPut(update);
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
    this.versionInfo = await this.getVersionInfo();
    if (
      this.latestUpdate &&
      new Date(this.latestUpdate.date) > new Date(Date.now() - 86400000)
    ) {
      update = this.latestUpdate;
    } else {
      let res = await fetch(`${UPDATES_BASE_URL}/update.json`);
      update = await res.json();
    }
    this.updateStatus.updateVersion = update?.latest;
    this.updateStatus.updateDate = update?.date;
    console.log(update.latest);
    const chunksInProgress = await this.db.update_progress
      .where({ root: update.latest })
      .filter((v) => v.completed === null)
      .count();
    console.log(`chunks ${chunksInProgress}`);
    if (chunksInProgress) {
      this.updateStatus.state = STATE.updating;
      return update;
    }

    if (!this.versionInfo || this.versionInfo !== update?.latest) {
      this.updateStatus.state = STATE.updateAvailable;
    } else {
      this.updateStatus.state = STATE.nothing;
    }
    this.latestUpdate = update;
    return update;
  }

  swName(onlineFirst: boolean | null | undefined = null) {
    const onlineFirstSW = onlineFirst ?? this.settings.preferOnline ?? false;
    return `/service-worker.js?preferOnline=${onlineFirstSW}`;
  }

  async enableServiceWorker(onlineFirst: boolean | null | undefined = null) {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register(this.swName(onlineFirst), {
        scope: "/",
      });
      this.registered = true;
    }
    // registerMessageHandler();
  }

  async disableServiceWorker() {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.unregister();
      this.registered = false;
    }
  }

  async updateAvailable() {
    await this.getUpdate();
    return this.status();
  }

  async status() {
    const installedVersion = await this.getVersionInfo();
    console.log(installedVersion);
    if (installedVersion?.currentVersion === this.updateStatus.updateVersion) {
      this.updateStatus.state = STATE.nothing;
      return this.updateStatus;
    }

    const progress = await this.getProgress();
    this.updateStatus.progress = progress;

    if (progress === 1) {
      this.db.version_info.put({
        current: this.updateStatus.updateVersion,
        updatedAt: new Date(),
      });
      this.updateStatus.currentVersion = this.updateStatus.updateVersion;
      this.updateStatus.currentDate = this.updateStatus.updateDate;
      this.updateStatus.state = STATE.nothing;
    }
    return this.updateStatus;
  }

  offlineSettings(): SettingsData {
    return (
      JSON.parse(window.localStorage.getItem("MDNSettings") || "null") ??
      new SettingsData()
    );
  }

  async setOfflineSettings(settingsData: SettingsData): Promise<SettingsData> {
    await new Promise((r) => setTimeout(() => r(null), 2000));
    const current = this.offlineSettings();

    if (!current.offline && settingsData.offline && !this.registered) {
      await this.enableServiceWorker(settingsData.preferOnline);
    } else if (
      "preferOnline" in settingsData &&
      current.preferOnline !== settingsData.preferOnline
    ) {
      await this.disableServiceWorker();
      await this.enableServiceWorker(settingsData.preferOnline);
    }
    if (current.offline && settingsData.offline === false) {
      await this.disableServiceWorker();
    }

    if (settingsData.autoUpdates === false && this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    } else if (
      settingsData.autoUpdates === true &&
      current.autoUpdates === false
    ) {
      await this.autoUpdate();
    }

    const settings = { ...current, ...settingsData };
    window.localStorage.setItem("MDNSettings", JSON.stringify(settings));
    this.settings = settings;
    return settings;
  }
  clear() {
    this.updateStatus.state = STATE.clearing;
    this.controller()?.postMessage({ type: "clear" });
  }

  async getProgress(): Promise<number> {
    if (!this.updateStatus || !this.updateStatus.updateVersion) {
      return -1;
    }

    const inprogress = await this.db.update_progress
      .where({ root: this.updateStatus.updateVersion })
      .filter((val) => !!val.completed)
      .count();
    const total = await this.db.update_progress
      .where({ root: this.updateStatus.updateVersion })
      .count();
    return inprogress / total;
  }
  async setStatus(updateStatus: UpdateStatus) {
    console.log(`setStatus current status: `, updateStatus);
    if (typeof updateStatus.currentDate !== "undefined") {
      this.updateStatus.currentDate = updateStatus.currentDate;
    }
    if (typeof updateStatus.currentVersion !== "undefined") {
      this.updateStatus.currentVersion = updateStatus.currentVersion;
    }

    if (updateStatus.state) {
      if (
        updateStatus.state === STATE.init &&
        this.updateStatus.state !== STATE.init
      ) {
        this.updating = false;
        this.updateStatus.updateVersion = null;
        this.updateStatus.updateDate = null;
        this.updateStatus.state = updateStatus.state;
        await this.getUpdate();
      } else {
        if ([STATE.clearing, STATE.updating].includes(updateStatus.state)) {
          this.updating = true;
        } else {
          this.updating = false;
        }
        this.updateStatus.state = updateStatus.state;
      }
    }
  }
}

declare global {
  interface Window {
    mdnWorker: MDNWorker;
  }
}

if (!window.mdnWorker) {
  window.mdnWorker = new MDNWorker();
}

// function registerMessageHandler() {
//   navigator.serviceWorker.addEventListener(
//     "message",
//     window.mdnWorker.messageHandler
//   );
// }

if (window.mdnWorker.settings.offline) {
  window.mdnWorker.enableServiceWorker(window.mdnWorker.settings.preferOnline);
}
