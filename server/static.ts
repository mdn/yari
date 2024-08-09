import path from "node:path";

import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";

import { staticMiddlewares } from "./middlewares.js";
import { resolveFundamental } from "../content/index.js";
import { STATIC_ROOT } from "../libs/env/index.js";

const app = express();
app.use(express.json());
app.use(compression());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // If we have a fundamental redirect mimic out Lambda@Edge and redirect.
  const { url: fundamentalRedirectUrl, status } = resolveFundamental(req.url);
  if (fundamentalRedirectUrl && status) {
    return res.redirect(status, fundamentalRedirectUrl);
  }
  return next();
});

app.get("/", async (req, res) => {
  res.redirect(302, "/en-US/");
});

app.use(staticMiddlewares);

app.use(cookieParser());

// This endpoint exists solely to accompany the headless tests.
// They will trigger XHR requests to `/api/v1/search?....`
// and use different values as a way to make expectations.
app.get("/api/v1/search", async (req, res) => {
  const page = parseInt((req.query.page as string) || "1");
  const PAGE_SIZE = 10;
  const documents = [];
  const metadata = {
    took_ms: 0.1,
    total: {
      value: 0,
      relation: "eq",
    },
    size: PAGE_SIZE,
    page,
  };
  const suggestions = [];

  // This stuff exists purely to end-to-end test mock the search
  // API which would otherwise go to Kuma.
  if (req.query.q && req.query.q === "FOO") {
    metadata.total.value = 1;
    documents.push({
      mdn_url: "/en-us/docs/Web/Foo",
      score: 1.1,
      title: "Foo",
      locale: "en-US",
      slug: "Web/Foo",
      popularity: 0.1,
      summary: "No summary",
      highlight: {
        body: null,
        title: null,
      },
    });
  } else if (req.query.q && /SERIAL\(\d+\)/.test(req.query.q as string)) {
    // A search for `?q=SERIAL(123)` will pretend it found 123 matches.
    // But paginate them and just make sure the URL and title are different.
    const serial = parseInt(
      (req.query.q as string).match(/SERIAL\((\d+)\)/)[1]
    );
    metadata.total.value = serial;

    for (const i of Array(Math.max(PAGE_SIZE, serial)).keys()) {
      documents.push({
        mdn_url: `/en-us/docs/Web/Serial${i}`,
        score: 1.1,
        title: `Serial ${i}`,
        locale: "en-US",
        slug: `Web/Serial${i}`,
        popularity: 1 - i / 10,
        summary: "No summary",
        highlight: {
          body: null,
          title: null,
        },
      });
    }
  }

  res.json({
    documents,
    metadata,
    suggestions,
  });
});

const mockWhoamiDatabase = new Map();

app.get("/api/v1/whoami", async (req, res) => {
  const sessionid = req.cookies.sessionid;
  const context =
    sessionid && mockWhoamiDatabase.has(sessionid)
      ? mockWhoamiDatabase.get(sessionid)
      : {};
  res.json(context);
});

const mockSettingsDatabase = new Map();

app.get("/api/v1/settings/", async (req, res) => {
  const defaultContext = { locale: "en-US" };
  if (!req.cookies.sessionid) {
    res.status(403).send("oh no you don't");
  } else {
    if (mockSettingsDatabase.has(req.cookies.sessionid)) {
      res.json(
        Object.assign(
          {},
          defaultContext,
          mockSettingsDatabase.get(req.cookies.sessionid)
        )
      );
    } else {
      res.json(defaultContext);
    }
  }
});

app.post("/api/v1/settings/", async (req, res) => {
  if (!req.cookies.sessionid) {
    res.status(403).send("oh no you don't");
  } else {
    mockSettingsDatabase.set(req.cookies.sessionid, {
      locale: req.body.locale,
    });
    res.json({ ok: true });
  }
});

const mockBookmarksDatabase = new Map();

app.post("/api/v1/plus/collection/", async (req, res) => {
  // Toggle
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send("missing url");
  }
  const bookmarks = mockBookmarksDatabase.get(req.cookies.sessionid) || [];
  const found = bookmarks.find((bookmark) => bookmark.url === req.query.url);
  if (found) {
    const newBookmarks = bookmarks.filter((bookmark) => bookmark.url !== url);
    mockBookmarksDatabase.set(req.cookies.sessionid, newBookmarks);
  } else {
    const makeTitle = (url) =>
      `Title of ${url.charAt(0).toUpperCase()}${url.slice(1).toLowerCase()}`;
    bookmarks.push({
      id: Math.max(...[0, ...bookmarks.map((b) => b.id)]) + 1,
      url,
      created: new Date(),
      parents: url
        .split("/")
        .slice(3)
        .map((uri, i) => {
          const prefix = url
            .split("/")
            .slice(0, 3 + i)
            .join("/");
          return { uri: `${prefix}/${uri}`, title: makeTitle(uri) };
        }),
      title: makeTitle(url),
    });
    mockBookmarksDatabase.set(req.cookies.sessionid, bookmarks);
  }
  res.status(201).json({ OK: true });
});

app.get("/api/v1/plus/collection/", async (req, res) => {
  if (!req.cookies.sessionid) {
    res.status(403).send("oh no you don't");
  } else {
    const bookmarks = mockBookmarksDatabase.get(req.cookies.sessionid) || [];
    if (req.query.url) {
      // Toggled?
      const found = bookmarks.find(
        (bookmark) => bookmark.url === req.query.url
      );
      res.json({
        bookmarked: found
          ? { id: found.id, created: found.created.toISOString() }
          : null,
      });
    } else {
      // Return all (paginated)
      const page = parseInt((req.query.page as string) || "1", 10);
      const pageSize = 5;
      const m = 0;
      const n = pageSize;
      res.json({
        items: bookmarks.slice(m, n).map((bookmark) => {
          return {
            ...bookmark,
            created: bookmark.created.toISOString(),
          };
        }),
        metadata: {
          total: bookmarks.length,
          page: page,
          per_page: pageSize,
        },
      });
    }
  }
});

app.get("/users/fxa/login/authenticate/", async (req, res) => {
  const userId = `${Math.ceil(10000 * Math.random())}`;
  res.cookie("sessionid", userId, {
    maxAge: 5 * 60 * 1000,
  });
  mockWhoamiDatabase.set(userId, {
    username: `my-${userId}`,
    is_authenticated: true,
    email: `${userId}@example.com`,
    // Note! Everyone who manages to sign in becomes a subscriber.
    // This is probably not ideal. Perhaps more ideal would be that
    // they sign in and become a subscriber later. But as of Aug 2021, it's
    // not obvious how we are going to integrate authentication with
    // with authorization. I.e. use of the subscription platform and FxA.
    is_subscriber: true,
  });
  res.redirect(req.query.next as string);
});

app.post("/users/fxa/login/logout/", async (req, res) => {
  if (!req.cookies.sessionid) {
    res.status(403).send("oh no you don't");
  } else {
    res.clearCookie("sessionid");
    mockWhoamiDatabase.delete(req.cookies.sessionid);
    res.redirect(`/en-US/`);
  }
});

// To mimic what CloudFront does.
app.get("/*", async (req, res) => {
  console.log(`Don't know how to mock: ${req.path}`, req.query);
  res
    .status(404)
    .sendFile(path.join(STATIC_ROOT, "en-us", "_spas", "404.html"));
});

const HOST = process.env.SERVER_HOST || undefined;
const PORT = parseInt(process.env.SERVER_PORT || "5042");
app.listen(PORT, HOST, () =>
  console.log(`Listening on ${HOST ? `${HOST}:` : "port "}${PORT}`)
);
