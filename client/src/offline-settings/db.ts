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

export enum ContentStatusPhase {
  INITIAL = "initial",
  IDLE = "idle",
  DOWNLOAD = "download",
  UNPACK = "unpack",
  CLEAR = "clear",
}

export interface ContentVersion {
  version: string;
  date: string;
}

export interface ContentStatus {
  id?: number;
  phase: ContentStatusPhase;
  local: ContentVersion | null;
  remote: ContentVersion | null;
  progress: number | null;
  timestamp: Date;
}

export class MDNOfflineDB extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  whoami!: Dexie.Table<Whoami, number>; // number = type of the primkey
  contentStatusHistory!: Dexie.Table<ContentStatus, number>;
  collections!: Dexie.Table<Collections, string>;
  watched!: Dexie.Table<Watched, String>;
  notifications!: Dexie.Table<Notifications, number>;

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
      contentStatusHistory: "++id",
    });
  }
}

const offlineDb = new MDNOfflineDB();

async function getContentStatus(): Promise<ContentStatus> {
  const current = await offlineDb.contentStatusHistory.toCollection().last();

  return (
    current || {
      phase: ContentStatusPhase.INITIAL,
      local: null,
      remote: null,
      progress: null,
      timestamp: new Date(),
    }
  );
}

async function patchContentStatus(
  changes: Omit<Partial<ContentStatus>, "id" | "timestamp">
) {
  const oldStatus = await getContentStatus();
  const newStatus = {
    ...oldStatus,
    ...changes,
    id: undefined,
    timestamp: new Date(),
  };

  if (newStatus.phase === ContentStatusPhase.INITIAL) {
    newStatus.phase = ContentStatusPhase.IDLE;
  }

  const table = offlineDb.contentStatusHistory;
  if (oldStatus.id && oldStatus.phase === newStatus.phase) {
    await table.update(oldStatus.id, newStatus);
  } else {
    await table.add(newStatus);
    // Keep latest entries for debugging.
    await table.reverse().offset(100).delete();
  }
}

export { offlineDb, getContentStatus, patchContentStatus };
