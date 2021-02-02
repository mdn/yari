const path = require("path");

const express = require("express");
const compression = require("compression");

const { staticMiddlewares } = require("./middlewares");
const { resolveFundamental } = require("../content");
const { STATIC_ROOT } = require("./constants");

const app = express();
app.use(express.json());
app.use(compression());

app.use((req, res, next) => {
  // If we have a fundamental redirect mimic out Lambda@Edge and redirect.
  const { url: fundamentalRedirectUrl, status } = resolveFundamental(req.url);
  if (fundamentalRedirectUrl && status) {
    return res.redirect(status, fundamentalRedirectUrl);
  }
  return next();
});

app.use(staticMiddlewares);

// This endpoint exists solely to accompany the headless tests.
// They will trigger XHR requests to `/api/v1/search?....`
// and use different values as a way to make expectations.
app.get("/api/v1/search", async (req, res) => {
  const PAGE_SIZE = 10;
  const documents = [];
  const metadata = {
    took_ms: 0.1,
    total: {
      value: 0,
      relation: "eq",
    },
    size: PAGE_SIZE,
    page: 1,
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
      archived: false,
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
        archived: false,
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
// To mimic what CloudFront does.
app.get("/*", async (req, res) => {
  res
    .status(404)
    .sendFile(path.join(STATIC_ROOT, "en-us", "_spas", "404.html"));
});

const PORT = parseInt(process.env.SERVER_PORT || "5000");
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
