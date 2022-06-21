import { getContentStatus, SwType } from "./db";

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

export class MDNWorker {
  settings: SettingsData;
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

  async messageHandler(event) {
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
    return `/service-worker.js?type=${type ?? SwType.ApiOnly}`;
  }

  async enableServiceWorker(type: SwType) {
    if ("serviceWorker" in navigator && !this.registered) {
      await navigator.serviceWorker.register(this.swName(type), {
        scope: "/",
      });
      this.registered = true;
    }
    registerMessageHandler();
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

  offlineSettings(): SettingsData {
    return (
      JSON.parse(window.localStorage.getItem("MDNSettings") || "null") ??
      new SettingsData()
    );
  }

  async setOfflineSettings(settingsData: SettingsData): Promise<SettingsData> {
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
      await this.enableServiceWorker(SwType.ApiOnly);
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

    const settings = { ...current, ...settingsData };
    window.localStorage.setItem("MDNSettings", JSON.stringify(settings));
    this.settings = settings;
    return settings;
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

const mdnWorker = getMDNWorker();

function registerMessageHandler() {
  navigator.serviceWorker.addEventListener("message", mdnWorker.messageHandler);
}

if (mdnWorker.settings.offline) {
  mdnWorker.enableServiceWorker(
    mdnWorker.settings.preferOnline ? SwType.PreferOnline : SwType.PreferOffline
  );
} else {
  mdnWorker.enableServiceWorker(SwType.ApiOnly);
}
