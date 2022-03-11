/* eslint no-restricted-globals: ["off", "self"] */
import {
  NotificationsInterceptor,
  CollectionsInterceptor,
  WatchedInterceptor,
  WhoamiInterceptor,
  DefaultApiInterceptor,
} from "./fetch-interceptors";
import { offlineDb } from "./db";

let interceptors = [
  new WhoamiInterceptor(offlineDb),
  new NotificationsInterceptor(offlineDb),
  new CollectionsInterceptor(offlineDb),
  new WatchedInterceptor(offlineDb),
];

let defaultInterceptor = new DefaultApiInterceptor(offlineDb);

export async function respond(e): Promise<Response> {
  const url = new URL(e.request.url);
  if ([self.location.host].includes(url.host)) {
    let handler = interceptors
      .filter((val) => val.handles(url.pathname))
      .shift();
    if (!handler && defaultInterceptor.handles(url.pathname)) {
      handler = defaultInterceptor;
    }
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
    if (!url.pathname.split("/").pop().includes(".")) {
      return await caches.match("/index.html");
    }
    if (url.pathname.startsWith("/en-US/docs/")) {
      url.pathname = url.pathname.toLowerCase();
      try {
        const response = await caches.match(url.href);
        if (response) {
          return response;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  const response = await fetch(e.request);
  return response;
}
