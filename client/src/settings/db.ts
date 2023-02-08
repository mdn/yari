// WARNING - This file is duplicated at two locations:
// - client/pwa/src/db.ts
// - client/src/settings/db.ts
// Until we find a solution, keep both files in sync.

import Dexie from "dexie";

export enum SwType {
  PreferOnline = "PreferOnline",
  PreferOffline = "PreferOffline",
}

export interface PlusSettings {
  col_in_search: boolean;
}

export interface Whoami {
  id?: number;
  username: string;
  is_authenticated: boolean;
  email: string;
  avatar_url: string;
  is_subscriber: boolean;
  settings: PlusSettings | null;
}

export enum ContentStatusPhase {
  INITIAL = "initial",
  IDLE = "idle",
  DOWNLOAD = "download",
  UNPACK = "unpack",
  CLEAR = "clear",
}

export interface LocalContentStatus {
  version: string;
  date: string;
}

export interface RemoteContentStatus {
  date: string;
  latest: string;
  updates: [string];
}

export interface ContentStatus {
  id?: number;
  phase: ContentStatusPhase;
  local: LocalContentStatus | null;
  remote: RemoteContentStatus | null;
  progress: number | null;
  timestamp: Date;
}

export class MDNOfflineDB extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  whoami!: Dexie.Table<Whoami, number>; // number = type of the primkey
  contentStatusHistory!: Dexie.Table<ContentStatus, number>;

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
    this.version(3).stores({
      whoami:
        "++, username, is_authenticated, email, avatar_url, is_subscriber, settings",
    });
    // We can drop the tables only after we stop using thing in the sw
    /*
    this.version(4).stores({
      collections: null,
      watched: null,
      notifications: null,
    });
    */
  }
}

export const offlineDb = new MDNOfflineDB();

export async function getContentStatus(): Promise<ContentStatus> {
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

export async function patchContentStatus(
  changes: Omit<Partial<ContentStatus>, "id" | "timestamp">
) {
  const db = offlineDb;
  const table = db.contentStatusHistory;

  await db.transaction("rw", table, async () => {
    const oldStatus = await getContentStatus();
    const newStatus = {
      ...oldStatus,
      ...changes,
      id: undefined,
      timestamp: new Date(),
    };

    if (oldStatus.phase === ContentStatusPhase.INITIAL && !changes.phase) {
      newStatus.phase = ContentStatusPhase.IDLE;
    }

    if (oldStatus.id && oldStatus.phase === newStatus.phase) {
      await table.update(oldStatus.id, newStatus);
    } else {
      await table.add(newStatus);
      // Keep latest entries for debugging.
      await table.reverse().offset(100).delete();
    }
  });
}
