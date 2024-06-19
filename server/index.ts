#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import chalk from "chalk";
import express from "express";
import send from "send";
import { createProxyMiddleware } from "http-proxy-middleware";
import cookieParser from "cookie-parser";
import openEditor from "open-editor";
import { getBCDDataForPath } from "@mdn/bcd-utils-api";
import sanitizeFilename from "sanitize-filename";

import {
  buildDocument,
  buildLiveSamplePageFromURL,
  renderContributorsTxt,
} from "../build/index.js";
import { findTranslations } from "../content/translations.js";
import { Document, Redirect, FileAttachment } from "../content/index.js";
import {
  ANY_ATTACHMENT_REGEXP,
  CSP_VALUE,
  DEFAULT_LOCALE,
  PLAYGROUND_UNSAFE_CSP_VALUE,
} from "../libs/constants/index.js";
import {
  STATIC_ROOT,
  PROXY_HOSTNAME,
  FAKE_V1_API,
  CONTENT_HOSTNAME,
  OFFLINE_CONTENT,
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  BLOG_ROOT,
} from "../libs/env/index.js";

import documentRouter from "./document.js";
import fakeV1APIRouter from "./fake-v1-api.js";
import { searchIndexRoute } from "./search-index.js";
import flawsRoute from "./flaws.js";
import { router as translationsRouter } from "./translations.js";
import { staticMiddlewares, originRequestMiddleware } from "./middlewares.js";
import { MEMOIZE_INVALIDATE, getRoot } from "../content/utils.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { renderHTML } from "../ssr/dist/main.js";
import {
  allPostFrontmatter,
  findPostLiveSampleBySlug,
  findPostBySlug,
  findPostPathBySlug,
} from "../build/blog.js";
import { findCurriculumPageBySlug } from "../build/curriculum.js";

async function buildDocumentFromURL(url: string) {
  const document = Document.findByURL(url);
  if (!document) {
    return null;
  }
  const documentOptions = {};
  if (CONTENT_TRANSLATED_ROOT) {
    // When you're running the dev server and build documents
    // every time a URL is requested, you won't have had the chance to do
    // the phase that happens when you do a regular `yarn build`.
    document.translations = findTranslations(
      document.metadata.slug,
      document.metadata.locale
    );
  }
  return await buildDocument(document, documentOptions);
}

const app = express();

const bcdRouter = express.Router({ caseSensitive: true });

// Note that this route will only get hit if .env has this: REACT_APP_BCD_BASE_URL=""
bcdRouter.get("/api/v0/current/:path.json", async (req, res) => {
  const data = getBCDDataForPath(req.params.path);
  return data ? res.json(data) : res.status(404).send("BCD path not found");
});

bcdRouter.use(
  "/updates/v0/",
  createProxyMiddleware({
    target: "http://localhost:8080",
    pathRewrite: (path) => path.replace("/bcd/updates/v0/", "/"),
  })
);

app.use("/bcd", bcdRouter);

// Depending on if FAKE_V1_API is set, we either respond with JSON based
// on `.json` files on disk or we proxy the requests to Kuma.
const target = `${
  ["developer.mozilla.org", "developer.allizom.org"].includes(PROXY_HOSTNAME)
    ? "https://"
    : "http://"
}${PROXY_HOSTNAME}`;
const proxy = FAKE_V1_API
  ? fakeV1APIRouter
  : createProxyMiddleware({
      target,
      changeOrigin: true,
      // proxyTimeout: 20000,
      // timeout: 20000,
    });

const stageApiProxy = createProxyMiddleware({
  target: `https://developer.allizom.org`,
  changeOrigin: true,
  proxyTimeout: 20000,
  timeout: 20000,
  headers: {
    Connection: "keep-alive",
  },
});

const contentProxy =
  CONTENT_HOSTNAME &&
  createProxyMiddleware({
    target: `https://${CONTENT_HOSTNAME}`,
    changeOrigin: true,
    // proxyTimeout: 20000,
    // timeout: 20000,
  });

app.use("/pong/*", stageApiProxy);
app.use("/pimg/*", stageApiProxy);
app.use("/api/v1/stripe/plans", stageApiProxy);
app.use("/api/*", proxy);
// This is an exception and it's only ever relevant in development.
app.use("/users/*", proxy);

// The proxy middleware has to come before all other middleware to avoid modifying the requests we proxy.

app.use(express.json());

// Needed because we read cookies in the code that mimics what we do in Lambda@Edge.
app.use(cookieParser());

app.use(originRequestMiddleware);

app.use(staticMiddlewares);

app.use(express.urlencoded({ extended: true }));

app.post(
  "/csp-violation-capture",
  express.json({ type: "application/csp-report" }),
  (req, res) => {
    const report = req.body["csp-report"];
    console.warn(
      chalk.yellow(
        "CSP violation for directive",
        report["violated-directive"],
        "which blocked:",
        report["blocked-uri"]
      )
    );
    res.sendStatus(200);
  }
);

app.use("/_document", documentRouter);

app.get("/_open", (req, res) => {
  const { line, column, filepath, url } = req.query as {
    line: string;
    column: string;
    filepath: string;
    url: string;
  };
  // Sometimes that 'filepath' query string parameter is a full absolute
  // filepath (e.g. /Users/peterbe/yari/content.../index.html), which usually
  // happens when you this is used from the displayed flaws on a preview
  // page.
  // But sometimes, it's a relative path and if so, it's always relative
  // to the main builder source.
  let absoluteFilepath;
  if (filepath) {
    if (fs.existsSync(filepath)) {
      absoluteFilepath = filepath;
    } else {
      const [locale] = filepath.split(path.sep);
      const root = getRoot(locale);
      absoluteFilepath = path.join(root, filepath);
    }
  } else if (url) {
    const document = Document.findByURL(url);
    if (!document) {
      res.status(410).send(`No known document by the URL '${url}'\n`);
    }
    absoluteFilepath = document.fileInfo.path;
  } else {
    throw new Error("No .filepath or .url in the request query");
  }

  // Double-check that the file can be found.
  if (!fs.existsSync(absoluteFilepath)) {
    return res.status(400).send(`${absoluteFilepath} does not exist on disk.`);
  }

  let spec = absoluteFilepath;
  if (line) {
    spec += `:${parseInt(line)}`;
    if (column) {
      spec += `:${parseInt(column)}`;
    }
  }
  openEditor([spec]);
  res.status(200).send(`Tried to open ${spec} in ${process.env.EDITOR}`);
});

app.use("/:locale/search-index.json", searchIndexRoute);

app.get("/_flaws", flawsRoute);

app.use("/_translations", translationsRouter);

app.get("/*/contributors.txt", async (req, res) => {
  const url = req.path.replace(/\/contributors\.txt$/, "");
  const document = Document.findByURL(url);
  res.setHeader("content-type", "text/plain");
  if (!document) {
    return res.status(404).send(`Document not found by URL (${url})`);
  }
  const { doc: builtDocument } = await buildDocument(document);
  res.send(
    renderContributorsTxt(
      document.metadata.contributors,
      builtDocument.source.github_url.replace("/blob/", "/commits/")
    )
  );
});

app.get(
  [
    "/:locale/curriculum/:slug([\\S\\/]+)/index.json",
    "/:locale/curriculum/index.json",
  ],
  async (req, res) => {
    const { slug = "" } = req.params;
    const data = await findCurriculumPageBySlug(slug);
    if (!data) {
      return res.status(404).send("Nothing here 🤷‍♂️");
    }
    return res.json(data);
  }
);

app.get("/:locale/blog/index.json", async (_, res) => {
  const posts = await allPostFrontmatter(
    { includeUnpublished: true },
    MEMOIZE_INVALIDATE
  );
  return res.json({ hyData: { posts } });
});
app.get("/:locale/blog/author/:slug/:asset", async (req, res) => {
  const { slug, asset } = req.params;
  return send(
    req,
    path.resolve(
      BLOG_ROOT,
      "..",
      "authors",
      sanitizeFilename(slug),
      sanitizeFilename(asset)
    )
  ).pipe(res);
});
if (BLOG_ROOT) {
  app.get("/:locale/blog/:slug/index.json", async (req, res) => {
    const { slug } = req.params;
    const data = await findPostBySlug(slug);
    if (!data) {
      return res.status(404).send("Nothing here 🤷‍♂️");
    }
    return res.json(data);
  });
  app.get(
    ["/:locale/blog/:slug/runner.html", "/:locale/blog/:slug/runner.html"],
    async (req, res) => {
      return res
        .setHeader("Content-Security-Policy", PLAYGROUND_UNSAFE_CSP_VALUE)
        .status(200)
        .sendFile(path.join(STATIC_ROOT, "runner.html"));
    }
  );
  app.get("/:locale/blog/:slug/_sample_.:id.html", async (req, res) => {
    const { slug, id } = req.params;
    try {
      return res.send(await findPostLiveSampleBySlug(slug, id));
    } catch (e) {
      return res.status(404).send(e.toString());
    }
  });
  app.get("/:locale/blog/:slug/:asset", async (req, res) => {
    const { slug, asset } = req.params;
    const p = findPostPathBySlug(slug);
    if (p) {
      return send(
        req,
        path.resolve(path.join(p, sanitizeFilename(asset)))
      ).pipe(res);
    }
    return res.status(404).send("Nothing here 🤷‍♂️");
  });
} else {
  console.warn("'BLOG_ROOT' not set in .env file");
}
app.get("/*", async (req, res, ...args) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  if (req.url.startsWith("/_")) {
    // URLs starting with _ is exclusively for the meta-work and if there
    // isn't already a handler, it's something wrong.
    return res.status(404).send("Page not found");
  }

  // If the catch-all gets one of these something's gone wrong
  if (req.url.startsWith("/static")) {
    return res.status(404).send("Page not found");
  }
  if (OFFLINE_CONTENT) {
    return res.status(404).send("Offline");
  }
  if (contentProxy) {
    console.log(`proxying: ${req.url}`);
    return contentProxy(req, res, ...args);
  }

  if (parsedUrl.pathname.endsWith("/runner.html")) {
    return res
      .setHeader("Content-Security-Policy", PLAYGROUND_UNSAFE_CSP_VALUE)
      .status(200)
      .sendFile(path.join(STATIC_ROOT, "runner.html"));
  }
  if (req.url.includes("/_sample_.")) {
    try {
      return res
        .setHeader("Content-Security-Policy", PLAYGROUND_UNSAFE_CSP_VALUE)
        .status(200)
        .send(await buildLiveSamplePageFromURL(req.path));
    } catch (e) {
      return res.status(404).send(e.toString());
    }
  }

  if (!req.url.includes("/docs/")) {
    // If it's a known SPA, like `/en-US/search` then that should have been
    // matched to its file and not end up here in the catchall handler.
    // Simulate what we do in the Lambda@Edge.
    return res
      .status(404)
      .sendFile(path.join(STATIC_ROOT, "en-us", "_spas", "404.html"));
  }

  if (ANY_ATTACHMENT_REGEXP.test(req.path)) {
    // Remember, FileAttachment.findByURLWithFallback() will return the absolute file path
    // iff it exists on disk.
    // Using a "fallback" strategy here so that images embedded in live samples
    // are resolved if they exist in en-US but not in <locale>
    const filePath = FileAttachment.findByURLWithFallback(req.path);
    if (filePath) {
      // The second parameter to `send()` has to be either a full absolute
      // path or a path that doesn't start with `../` otherwise you'd
      // get a 403 Forbidden.
      // See https://github.com/mdn/yari/issues/1297
      return send(req, path.resolve(filePath)).pipe(res);
    }
    return res.status(404).send("File not found on disk");
  }

  let lookupURL = decodeURI(req.path);
  let extraSuffix = "";
  let isMetadata = false;
  let isDocument = false;

  if (req.path.endsWith("index.json")) {
    // It's a bit special then.
    // The URL like me something like
    // /en-US/docs/HTML/Global_attributes/index.json
    // and that won't be found in getRedirectUrl() since that doesn't
    // index things with the '/index.json' suffix. So we need to
    // temporarily remove it and remember to but it back when we're done.
    isDocument = true;
    extraSuffix = "/index.json";
    lookupURL = lookupURL.replace(extraSuffix, "");
  } else if (req.path.endsWith("metadata.json")) {
    isMetadata = true;
    extraSuffix = "/metadata.json";
    lookupURL = lookupURL.replace(extraSuffix, "");
  }

  const isJSONRequest = extraSuffix.endsWith(".json");

  let document;
  try {
    console.time(`buildDocumentFromURL(${lookupURL})`);
    const built = await buildDocumentFromURL(lookupURL);
    if (built) {
      document = built.doc;
    } else if (
      lookupURL.split("/")[1] &&
      lookupURL.split("/")[1].toLowerCase() !== DEFAULT_LOCALE.toLowerCase() &&
      !CONTENT_TRANSLATED_ROOT
    ) {
      // Such a common mistake. You try to view a URL that is not en-US but
      // you forgot to set CONTENT_TRANSLATED_ROOT.
      console.warn(
        `URL is for locale '${
          lookupURL.split("/")[1]
        }' but CONTENT_TRANSLATED_ROOT is not set. URL will 404.`
      );
    }
  } catch (error) {
    console.error(`Error in buildDocumentFromURL(${lookupURL})`, error);
    return res.status(500).send(error.toString());
  } finally {
    console.timeEnd(`buildDocumentFromURL(${lookupURL})`);
  }

  if (!document) {
    const redirectURL = Redirect.resolve(lookupURL);
    if (redirectURL !== lookupURL) {
      return res.redirect(301, redirectURL + extraSuffix);
    }
    return res
      .status(404)
      .sendFile(path.join(STATIC_ROOT, "en-us", "_spas", "404.html"));
  }

  if (isDocument) {
    res.json({ doc: document });
  } else if (isMetadata) {
    const docString = JSON.stringify({ doc: document });

    const hash = crypto.createHash("sha256").update(docString).digest("hex");
    const { body: _, toc: __, sidebarHTML: ___, ...builtMetadata } = document;
    builtMetadata.hash = hash;

    res.json(builtMetadata);
  } else if (isJSONRequest) {
    // TODO: what's this for?
    res.json({ doc: document });
  } else {
    res.header("Content-Security-Policy", CSP_VALUE);
    res.send(renderHTML({ doc: document, url: lookupURL }));
  }
});

if (!fs.existsSync(path.resolve(CONTENT_ROOT))) {
  throw new Error(`${path.resolve(CONTENT_ROOT)} does not exist!`);
}

console.log(
  `CONTENT_ROOT: ${chalk.bold(CONTENT_ROOT)}`,
  path.resolve(CONTENT_ROOT) !== CONTENT_ROOT
    ? chalk.grey(`(absolute path: ${path.resolve(CONTENT_ROOT)})`)
    : ""
);

const PORT = parseInt(process.env.SERVER_PORT || "5042");
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  if (process.env.EDITOR) {
    console.log(`Your EDITOR is set to: ${chalk.bold(process.env.EDITOR)}`);
  } else {
    console.warn(
      chalk.yellow(
        "Warning! You have not set an EDITOR environment variable. " +
          'Using the "Open in your editor" button will probably fail.'
      )
    );
  }
});
