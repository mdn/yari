/* eslint no-restricted-globals: ["off", "self"] */
import {
  NotificationsInterceptor,
  CollectionsInterceptor,
  WatchedInterceptor,
  WhoamiInterceptor,
  DefaultApiInterceptor,
} from "./fetch-interceptors";
import { offlineDb } from "./db";
import { INTERACTIVE_EXAMPLES_URL, LIVE_SAMPLES_URL } from "./service-worker";

let interceptors = [
  new WhoamiInterceptor(offlineDb),
  new NotificationsInterceptor(offlineDb),
  new CollectionsInterceptor(offlineDb),
  new WatchedInterceptor(offlineDb),
];

let defaultInterceptor = new DefaultApiInterceptor(offlineDb);

export async function respond(e): Promise<Response> {
  const url = new URL(e.request.url);
  if (
    [
      self.location.host,
      INTERACTIVE_EXAMPLES_URL.host,
      LIVE_SAMPLES_URL.host,
    ].includes(url.host)
  ) {
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
      url.pathname = "/index.html";
    } else if (url.pathname === "/index.json") {
      url.pathname = "/en-us/index.json";
    } else if (url.pathname.startsWith("/en-US/docs/")) {
      url.pathname = url.pathname.toLowerCase();
    }
    try {
      const response = await caches.match(url.href);
      if (response) {
        return response;
      }
    } catch (e) {
      console.error(e);
    }
  }
  const response = await fetch(e.request);
  return response;
}
