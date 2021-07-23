const path = require("path");

const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const { staticMiddlewares } = require("./middlewares");
const { resolveFundamental } = require("../content");
const { STATIC_ROOT } = require("./constants");

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

app.use(staticMiddlewares);

app.use(cookieParser());

// This endpoint exists solely to accompany the headless tests.
// They will trigger XHR requests to `/api/v1/search?....`
// and use different values as a way to make expectations.
app.get("/api/v1/search", async (req, res) => {
  const page = parseInt(req.query.page || "1");
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
  } else if (req.query.q && /SERIAL\(\d+\)/.test(req.query.q)) {
    // A search for `?q=SERIAL(123)` will pretend it found 123 matches.
    // But paginate them and just make sure the URL and title are different.
    const serial = parseInt(req.query.q.match(/SERIAL\((\d+)\)/)[1]);
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

app.get("/api/v1/settings", async (req, res) => {
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

app.post("/api/v1/settings", async (req, res) => {
  if (!req.cookies.sessionid) {
    res.status(403).send("oh no you don't");
  } else {
    mockSettingsDatabase.set(req.cookies.sessionid, {
      locale: req.body.locale,
    });
    res.json({ ok: true });
  }
});

app.get("/users/github/login/", async (req, res) => {
  const userId = `${Math.ceil(10000 * Math.random())}`;
  res.cookie("sessionid", userId, {
    maxAge: 60 * 1000,
  });
  mockWhoamiDatabase.set(userId, {
    username: `my-${userId}`,
    is_authenticated: true,
    email: `${userId}@example.com`,
  });
  res.redirect(req.query.next);
});

app.get("/users/google/login/", async (req, res) => {
  const userDetails = {
    name: "Peter",
  };
  const sp = new URLSearchParams();
  sp.set("next", req.query.next || "/en-US/");
  sp.set("user_details", JSON.stringify(userDetails));
  sp.set("csrfmiddlewaretoken", `${Math.random()}`);
  sp.set("provider", "google");

  res.redirect(`/en-US/signup?${sp.toString()}`);
});

app.post("/:locale/users/account/signup", async (req, res) => {
  const userId = `${Math.ceil(10000 * Math.random())}`;
  res.cookie("sessionid", userId, {
    maxAge: 60 * 1000,
  });
  mockWhoamiDatabase.set(userId, {
    username: `Googler-username-${userId}`,
    is_authenticated: true,
    email: `${userId}@gmail.com`,
  });
  res.redirect(req.query.next || `/${req.params.locale}/`);
});

app.post("/:locale/users/signout", async (req, res) => {
  res.clearCookie("sessionid");
  res.redirect(`/${req.params.locale}/`);
});

// To mimic what CloudFront does.
app.get("/*", async (req, res) => {
  console.log(`Don't know how to mock: ${req.path}`, req.query);
  res
    .status(404)
    .sendFile(path.join(STATIC_ROOT, "en-us", "_spas", "404.html"));
});

const PORT = parseInt(process.env.SERVER_PORT || "5000");
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
