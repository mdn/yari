import Dexie from "dexie";

interface Watched {
  url: string;
  title: string;
  path: string;
  status: string;
}

interface Notifications {
  id: number;
  title: string;
  text: string;
  url: string;
  created: Date;
  read: boolean;
  starred: boolean;
}

interface Parent {
  uri: string;
  title: string;
}

interface Collections {
  id?: number;
  url: string;
  title: string;
  parents?: Array<Parent>[];
  notes?: string;
  created: Date;
}

interface Whoami {
  id?: number;
  username: string;
  is_authenticated: boolean;
  email: string;
  avatar_url: string;
  is_subscriber: boolean;
}

export interface UpdateMetadata {
  filename: string;
  root: string;
  completed?: Date | null;
  error: boolean;
}

export interface VersionInfo {
  current?: string | null;
  updatedAt?: Date | null;
}

export class MDNOfflineDB extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  whoami!: Dexie.Table<Whoami, number>; // number = type of the primkey
  collections!: Dexie.Table<Collections, string>;
  watched!: Dexie.Table<Watched, String>;
  notifications!: Dexie.Table<Notifications, number>;
  update_progress!: Dexie.Table<UpdateMetadata, String>;
  version_info!: Dexie.Table<VersionInfo, String>;

  constructor() {
    super("MDNOfflineDB");
    this.version(1).stores({
      whoami:
        "++, username, is_authenticated, email, avatar_url, is_subscriber",
      collections: "url, title, created",
      watched: "url, title, path",
      notifications: "id, title, text, url, created, read, starred",
    });
    this.version(2).stores({
      update_progress: "filename, root, completed, error",
      version_info: "current, updatedAt",
    });
  }
}
