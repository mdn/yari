import { OfflineSettingsData } from "../user-context";
import { getContentStatus, SwType, offlineDb } from "./db";

export class MDNWorker {
  settings: OfflineSettingsData;
  registered: boolean;
  timeout?: ReturnType<typeof setTimeout> | null;
  keepAlive: ReturnType<typeof setInterval> | null;

  constructor() {
    this.settings = this.offlineSettings();
    this.registered = false;
    this.timeout = null;
    this.keepAlive = null;

    if (this.settings.autoUpdates) {
      this.autoUpdate();
    }
    if (this.settings.offline) {
      this.enableServiceWorker(
        this.settings.preferOnline ? SwType.PreferOnline : SwType.PreferOffline
      );
    } else {
      this.disableServiceWorker();
    }
  }

  autoUpdate() {
    console.log("running auto update");
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.update();
    this.timeout = setTimeout(() => this.autoUpdate(), 60 * 60 * 1000);
  }

  messageHandler(event) {
    switch (event.data.type) {
      case "pong":
        console.log("pong");
        break;
      default:
        console.log("unknown message");
    }
  }

  controller(): ServiceWorker | null {
    return navigator.serviceWorker.controller;
  }

  checkForUpdate(): void {
    this.controller()?.postMessage({ type: "checkForUpdate" });
  }

  update() {
    this.controller()?.postMessage({ type: "update" });
  }

  swName(type: SwType | null | undefined = null) {
    return `/service-worker.js?type=${type ?? SwType.PreferOnline}`;
  }

  registerMessageHandler() {
    navigator.serviceWorker.addEventListener("message", (e) =>
      this.messageHandler(e)
    );
  }

  async enableServiceWorker(type: SwType) {
    if ("serviceWorker" in navigator && !this.registered) {
      await navigator.serviceWorker.register(this.swName(type), {
        scope: "/",
      });
      this.registered = true;
    }
    this.registerMessageHandler();
  }

  cleanDb() {
    offlineDb.delete();
  }

  async disableServiceWorker() {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.unregister();
      this.registered = false;
    }
  }

  toggleKeepAlive(keepAlive: boolean) {
    if (this.keepAlive && !keepAlive) {
      console.log("[worker] keepalive -> enabling");
      clearInterval(this.keepAlive);
      this.keepAlive = null;
    } else if (keepAlive && !this.keepAlive) {
      console.log("[worker] keepalive -> disabling");
      this.keepAlive = setInterval(
        () => this.controller()?.postMessage({ type: "keepalive" }),
        10000
      );
    }
  }

  async status() {
    return await getContentStatus();
  }

  offlineSettings(): OfflineSettingsData {
    return OfflineSettingsData.read();
  }

  async setOfflineSettings(
    settingsData: Partial<OfflineSettingsData>
  ): Promise<OfflineSettingsData> {
    const current = this.offlineSettings();

    if (!current.offline && settingsData.offline) {
      await this.disableServiceWorker();
      await this.enableServiceWorker(
        settingsData.preferOnline || current.preferOnline
          ? SwType.PreferOnline
          : SwType.PreferOffline
      );
    } else if (
      "preferOnline" in settingsData &&
      current.preferOnline !== settingsData.preferOnline
    ) {
      await this.disableServiceWorker();
      await this.enableServiceWorker(
        settingsData.preferOnline ? SwType.PreferOnline : SwType.PreferOffline
      );
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
      this.autoUpdate();
    }

    this.settings = new OfflineSettingsData({ ...current, ...settingsData });
    this.settings.write();
    return this.settings;
  }

  async clearOfflineSettings() {
    await this.setOfflineSettings(new OfflineSettingsData());
  }

  async clear() {
    this.controller()?.postMessage({ type: "clear" });
  }
}

declare global {
  interface Window {
    mdnWorker: MDNWorker;
  }
}

export function getMDNWorker(): MDNWorker {
  if (!window.mdnWorker) {
    window.mdnWorker = new MDNWorker();
  }
  return window.mdnWorker;
}
