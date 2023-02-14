/* eslint no-restricted-globals: ["off", "self"] */
import {
  WhoamiInterceptor,
  DefaultApiInterceptor,
} from "./fetch-interceptors.js";
import { offlineDb } from "./db.js";
import {
  INTERACTIVE_EXAMPLES_URL,
  USER_CONTENT_URL,
} from "./service-worker.js";
import { openCache } from "./caches.js";

let interceptors = [new WhoamiInterceptor(offlineDb)];

let defaultInterceptor = new DefaultApiInterceptor(offlineDb);

export async function fetchWithExampleOverride(request) {
  const examplesPrefix = `${location.origin}/examples`;
  if (request.url.startsWith(examplesPrefix)) {
    const res = await fetch(
      request.url.replace(examplesPrefix, INTERACTIVE_EXAMPLES_URL.origin)
    );
    if (res.ok) {
      return res;
    }
  }
  const res = await fetch(request);
  return res;
}

export async function respond(e): Promise<Response> {
  const url = new URL(e.request.url);
  if ([self.location.host, USER_CONTENT_URL.host].includes(url.host)) {
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

    if (url.hostname === USER_CONTENT_URL.hostname) {
      // Cache the avatar if not cached already
      let response = await caches.match(url.href);
      if (!response) {
        const cache = await openCache();
        try {
          response = await fetch(e.request);
          cache.put(url.href, response.clone());
          return response.clone();
        } catch (e) {
          console.error(e);
        }
      } else {
        return response;
      }
    } else if (url.pathname.startsWith("/bcd/")) {
      url.pathname = url.pathname.replace(/api\/v[0-9]\/[^/]+\//, "");
    } else if (url.pathname.startsWith("/examples/") && url.search) {
      url.search = "";
    } else if (!url.pathname.split("/").pop().includes(".")) {
      url.pathname = "/index.html";
    } else if (url.pathname === "/index.json") {
      url.pathname = "/en-us/index.json";
    } else if (url.pathname.startsWith("/en-US/")) {
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
  const response = await fetchWithExampleOverride(e.request);
  return response;
}
