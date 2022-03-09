import { MDNOfflineDB } from "./db";

const PATH_COLLECTIONS = "/api/v1/plus/collection";
const PATH_WHOAMI = "/api/v1/whoami";
const PATH_WATCHING = "/api/v1/plus/watched";
const PATH_WATCH = "/api/v1/plus/watch"; //Change to watching
const PATH_NOTIFICATIONS = "/api/v1/plus/notifications";

interface FetchInterceptor {
  db: MDNOfflineDB;
  handles(url: string): boolean;
  onGet(req: Request): Promise<Response>;
  onPost(req: Request): Promise<Response>;
}

function jsonBlob(json) {
  return new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
}

class WhoamiInterceptor implements FetchInterceptor {
  db: MDNOfflineDB;

  constructor(db: MDNOfflineDB) {
    this.db = db;
  }

  handles(path: string): boolean {
    return path.startsWith(PATH_WHOAMI);
  }

  async onGet(req: Request): Promise<Response> {
    try {
      const res = await fetch(req);
      const json = await res.clone().json();
      if (json?.username) {
        await this.db.whoami.put(json, 0);
      }
      return res;
    } catch (err: any) {
      const whoami = await this.db.whoami.get(1);
      return new Response(jsonBlob(whoami));
    }
  }
  async onPost(req: Request): Promise<Response> {
    return await fetch(req);
  }
}

class CollectionsInterceptor implements FetchInterceptor {
  db: MDNOfflineDB;

  constructor(db: MDNOfflineDB) {
    this.db = db;
  }

  handles(path: string): boolean {
    return path.startsWith(PATH_COLLECTIONS);
  }

  async onGet(req: Request): Promise<Response> {
    try {
      const res = await fetch(req);
      const json = await res.clone().json();
      if (json?.items) {
        this.db.collections.bulkPut(json.items);
      } else if (json?.bookmarked) {
        this.db.collections.put(json.bookmarked);
      }
      return res;
    } catch (err) {
      const url = new URL(req.url).searchParams.get("url");
      if (url) {
        //Single request case.
        const item = await this.db.collections.get({ url: url });
        return new Response(jsonBlob({ bookmarked: item }));
      } else {
        const collection = await this.db.collections.toCollection().toArray();
        return new Response(
          jsonBlob({
            items: collection,
            metadata: { total: collection.length, per_page: collection.length },
          })
        );
      }
    }
  }
  async onPost(req: Request): Promise<Response> {
    return await fetch(req);
  }
}

class NotificationsInterceptor implements FetchInterceptor {
  db: MDNOfflineDB;

  constructor(db: MDNOfflineDB) {
    this.db = db;
  }

  handles(path: string): boolean {
    return path.startsWith(PATH_NOTIFICATIONS);
  }

  async onGet(req: Request): Promise<Response> {
    try {
      const res = await fetch(req);
      const json = await res.clone().json();
      if (json?.items) {
        await this.db.notifications.bulkPut(json?.items);
      }
      return res;
    } catch (err: any) {
      let notifications = await this.db.notifications.toCollection().toArray();
      const limit = new URLSearchParams(req.url).get("limit");
      if (limit) {
        notifications = notifications.slice(0, parseInt(limit));
      }
      return new Response(jsonBlob({ items: notifications }));
    }
  }
  async onPost(req: Request): Promise<Response> {
    return await fetch(req);
  }
}

class WatchedInterceptor implements FetchInterceptor {
  db: MDNOfflineDB;

  constructor(db: MDNOfflineDB) {
    this.db = db;
  }

  handles(path: string): boolean {
    return path.startsWith(PATH_WATCHING);
  }

  async onGet(req: Request): Promise<Response> {
    try {
      const res = await fetch(req);
      const json = await res.clone().json();
      if (json?.items) {
        await this.db.watched.bulkPut(json.items);
      }
      return res;
    } catch (err: any) {
      let watching;
      try {
        watching = await this.db.watched.toCollection().toArray();
      } catch (err) {
        console.log(err);
        watching = [];
      }
      return new Response(jsonBlob({ items: watching }));
    }
  }
  async onPost(req: Request): Promise<Response> {
    return await fetch(req);
  }
}

export {
  WhoamiInterceptor,
  CollectionsInterceptor,
  WatchedInterceptor,
  NotificationsInterceptor,
};
