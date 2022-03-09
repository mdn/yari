import Dexie from "dexie";

interface Watched {
  url: string;
  title: string;
  path: string;
}

interface Notifications {
  id: number;
  title: string;
  text: string;
  url: string;
  created: string;
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
}

interface Whoami {
  id?: number;
  username: string;
  is_authenticated: boolean;
  email: string;
  avatar_url: string;
  is_subscriber: boolean;
}

export class MDNOfflineDB extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  whoami!: Dexie.Table<Whoami, number>; // number = type of the primkey
  collections!: Dexie.Table<Collections, string>;
  watched!: Dexie.Table<Watched, String>;
  notifications!: Dexie.Table<Notifications, number>;

  constructor() {
    super("MDNOfflineDB");
    this.version(1).stores({
      whoami:
        "++id, username, is_authenticated, email, avatar_url, is_subscriber",
      collections: "url, title, parents, notes",
      watched: "url, title, path",
      notifications: "id, title, text, url, created, read, starred",
    });
  }
}

const offlineDb = new MDNOfflineDB();

export { offlineDb };
