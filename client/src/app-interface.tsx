export enum STATE {
  init = "init",
  nothing = "nothing",
  clearing = "clearing",
  updateAvailable = "updateAvailable",
  downloading = "downloading",
  unpacking = "unpacking",
}

export interface SettingsData {
  offline: boolean | null;
  autoUpdates: boolean | null;
}

export interface UpdateStatus {
  progress: Number;
  state: STATE;
  currentVersion: String | null;
  currentDate: string | null;
}

export interface DesktopApp {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  update: () => Promise<void>;
  updateAvailable: () => Promise<UpdateStatus>;
  updateUser: () => Promise<void>;
  updateStatus: () => Promise<UpdateStatus>;
  clear: () => Promise<void>;
  offlineSettings: () => Promise<SettingsData>;
  setOfflineSettings: (settingsData: SettingsData) => Promise<SettingsData>;
  setTitle: (title) => Promise<void>;
}

declare global {
  interface Window {
    Desktop: DesktopApp;
  }
}

interface External {
  setTitle: (title: String) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  settings: () => Promise<void>;
}
declare global {
  interface Window {
    Android: External;
  }
}
