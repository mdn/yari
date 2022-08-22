import { MDNOfflineDB } from "./db";

const PATH_COLLECTIONS = "/api/v1/plus/collection";
const PATH_WHOAMI = "/api/v1/whoami";
const PATH_WATCHING = "/api/v1/plus/watching";
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

function boolOrNull(s): boolean | null {
  let bon = s ?? null;
  if (bon !== null) {
    return s === "true";
  }
  return null;
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
        await this.db.whoami.put(json, 1);
      }
      return res;
    } catch (err: any) {
      const whoami = await this.db.whoami.get(1);
      return new Response(jsonBlob({ ...whoami, offline: true }));
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
    const params = new URL(req.url).searchParams;
    const url = params.get("url");
    try {
      const res = await fetch(req);
      const json = await res.clone().json();
      if (json?.items) {
        this.db.collections.bulkPut(json.items);
      } else if (json?.bookmarked) {
        this.db.collections.put(json.bookmarked);
      } else if (json?.bookmarked === null && url) {
        this.db.collections.where("url").equals(url).delete();
      }
      return res;
    } catch (err) {
      if (url) {
        //Single request case.
        const item = await this.db.collections.get({ url: url });
        return new Response(jsonBlob({ bookmarked: item, offline: true }));
      } else {
        let collection = [];
        if (params.get("sort") === "title") {
          collection = await this.db.collections
            .orderBy("created")
            .reverse()
            .toArray();
        } else {
          collection = await this.db.collections.orderBy("title").toArray();
        }
        collection = filter(params, collection);

        const limit = params.get("limit");
        const offset = params.get("offset");

        if (limit && offset) {
          collection = collection.slice(parseInt(offset), parseInt(limit));
        }
        return new Response(jsonBlob({ items: collection, offline: true }));
      }
    }
  }
  async onPost(req: Request): Promise<Response> {
    try {
      const res = await fetch(req);
      return res;
    } catch (err) {
      return new Response(jsonBlob({ error: "offline" }));
    }
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
      const params = new URL(req.url).searchParams;

      let notifications;
      if (params.get("sort") === "title") {
        notifications = await this.db.notifications.orderBy("title").toArray();
      } else {
        notifications = await this.db.notifications
          .orderBy("created")
          .reverse()
          .toArray();
      }

      const starred = boolOrNull(params.get("starred"));
      if (starred) {
        notifications = notifications.filter((v) => v.starred === starred);
      }
      const unread = boolOrNull(params.get("unread"));
      if (unread !== null) {
        notifications = notifications.filter((v) => v.read === !unread);
      }
      notifications = filter(params, notifications);
      const limit = params.get("limit");
      const offset = params.get("offset");

      if (limit && offset) {
        notifications = notifications.slice(parseInt(offset), parseInt(limit));
      }
      return new Response(jsonBlob({ items: notifications, offline: true }));
    }
  }
  async onPost(req: Request): Promise<Response> {
    try {
      return await fetch(req);
    } catch (err) {
      return new Response(jsonBlob({ error: "offline" }));
    }
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
      } else if (json?.status !== "unwatched") {
        await this.db.watched.put(json);
      }
      return res;
    } catch (err: any) {
      let watching;
      try {
        const params = new URL(req.url).searchParams;
        const url = params.get("url");
        if (url) {
          const watched = await this.db.watched.get({ url: url.toLowerCase() });
          if (watched) {
            return new Response(
              jsonBlob({ ...watched, status: "major", offline: true })
            );
          } else {
            return new Response(jsonBlob({ error: "offline" }));
          }
        } else {
          watching = await this.db.watched.toCollection().toArray();
          watching = filter(params, watching);
          const limit = params.get("limit");
          const offset = params.get("offset");
          if (limit && offset) {
            watching = watching.slice(parseInt(offset), parseInt(limit));
          }
          // We don't store the status.
          watching = watching.map((val) => {
            return { ...val, status: "major" };
          });
        }
      } catch (err) {
        console.error(err);
        watching = [];
      }
      return new Response(jsonBlob({ items: watching, offline: true }));
    }
  }
  async onPost(req: Request): Promise<Response> {
    try {
      const res = await fetch(req);
      return res;
    } catch (err) {
      return new Response(jsonBlob({ error: "offline" }));
    }
  }
}

class DefaultApiInterceptor implements FetchInterceptor {
  db: MDNOfflineDB;

  constructor(db: MDNOfflineDB) {
    this.db = db;
  }

  handles(path: string): boolean {
    return path.startsWith("/api/v1/") || path.startsWith("/users/fxa/");
  }

  async onGet(req: Request): Promise<Response> {
    try {
      return await fetch(req);
    } catch (err: any) {
      return new Response(jsonBlob({ error: "offline" }));
    }
  }
  async onPost(req: Request): Promise<Response> {
    try {
      return await fetch(req);
    } catch (err) {
      return new Response(jsonBlob({ error: "offline" }));
    }
  }
}

function filter(params: URLSearchParams, input: Array<any>) {
  if (params.get("q")) {
    input = input.filter((val) =>
      val.title.toLowerCase().includes(params.get("q").toLowerCase())
    );
  }
  return input;
}

export {
  WhoamiInterceptor,
  CollectionsInterceptor,
  WatchedInterceptor,
  NotificationsInterceptor,
  DefaultApiInterceptor,
};
