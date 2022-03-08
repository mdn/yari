import {
  NotificationsInterceptor,
  CollectionsInterceptor,
  WatchedInterceptor,
  WhoamiInterceptor,
} from "./fetch-interceptors";
import { offlineDb } from "./db";

let interceptors = [
  new WhoamiInterceptor(offlineDb),
  new NotificationsInterceptor(offlineDb),
  new CollectionsInterceptor(offlineDb),
  new WatchedInterceptor(offlineDb),
];

export async function respond(e): Promise<Response> {
  const url = new URL(e.request.url);
  console.log(`going for: ${url.href}`);
  if ([self.location.host].includes(url.host)) {
    const handler = interceptors
      .filter((val) => val.handles(url.pathname))
      .shift();
    if (handler) {
      if (e.request.method === "GET") {
        return handler.onGet(e.request);
      } else if (e.request.method === "POST") {
        return handler.onPost(e.request);
      } else {
        return await fetch(e.request);
      }
    }

    const r = await caches.match(e.request);
    if (r) {
      return r;
    }
    console.log(`hit test: ${url.href}`);
    if (url.pathname.startsWith("/en-US/docs/")) {
      url.pathname = url.pathname.toLowerCase();
      try {
        const response = await caches.match(url.href);
        if (response) {
          console.log(`from cache: ${url.href}`);
          return response;
        }
      } catch (e) {
        console.log(url.href);
        console.log(e);
      }
    }
  }
  const response = await fetch(e.request);
  return response;
}
