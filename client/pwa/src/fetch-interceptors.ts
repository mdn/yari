import { MDNOfflineDB } from "./db.js";

const PATH_WHOAMI = "/api/v1/whoami";

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

export class WhoamiInterceptor implements FetchInterceptor {
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

export class DefaultApiInterceptor implements FetchInterceptor {
  db: MDNOfflineDB;

  constructor(db: MDNOfflineDB) {
    this.db = db;
  }

  handles(path: string): boolean {
    return path.startsWith("/api/") || path.startsWith("/users/fxa/");
  }

  async onGet(req: Request): Promise<Response> {
    try {
      return await fetch(req);
    } catch (err: any) {
      return new Response(jsonBlob({ error: "offline" }), {
        status: 418,
        statusText: "You're offline",
      });
    }
  }
  async onPost(req: Request): Promise<Response> {
    try {
      return await fetch(req);
    } catch (err) {
      return new Response(jsonBlob({ error: "offline" }), {
        status: 418,
        statusText: "You're offline",
      });
    }
  }
}
