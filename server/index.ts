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

import {
  buildDocument,
  buildLiveSamplePageFromURL,
  renderContributorsTxt,
} from "../build";
import { findDocumentTranslations } from "../content/translations";
import { Document, Redirect, Image } from "../content";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env";
import { CSP_VALUE, DEFAULT_LOCALE } from "../libs/constants";
import {
  STATIC_ROOT,
  PROXY_HOSTNAME,
  FAKE_V1_API,
  CONTENT_HOSTNAME,
  OFFLINE_CONTENT,
} from "../libs/env";

import documentRouter from "./document";
import fakeV1APIRouter from "./fake-v1-api";
import { searchIndexRoute } from "./search-index";
import flawsRoute from "./flaws";
import { router as translationsRouter } from "./translations";
import { staticMiddlewares, originRequestMiddleware } from "./middlewares";
import { getRoot } from "../content/utils";

import { renderHTML } from "../ssr/dist/main";

async function buildDocumentFromURL(url) {
  const document = Document.findByURL(url);
  if (!document) {
    return null;
  }
  const documentOptions = {};
  if (CONTENT_TRANSLATED_ROOT) {
    // When you're running the dev server and build documents
    // every time a URL is requested, you won't have had the chance to do
    // the phase that happens when you do a regular `yarn build`.
    document.translations = findDocumentTranslations(document);
  }
  return await buildDocument(document, documentOptions);
}

const app = express();

// Depending on if FAKE_V1_API is set, we either respond with JSON based
// on `.json` files on disk or we proxy the requests to Kuma.
const proxy = FAKE_V1_API
  ? fakeV1APIRouter
  : createProxyMiddleware({
      target: `${
        ["developer.mozilla.org", "developer.allizom.org"].includes(
          PROXY_HOSTNAME
        )
          ? "https://"
          : "http://"
      }${PROXY_HOSTNAME}`,
      changeOrigin: true,
      // proxyTimeout: 20000,
      // timeout: 20000,
    });

const contentProxy =
  CONTENT_HOSTNAME &&
  createProxyMiddleware({
    target: `https://${CONTENT_HOSTNAME}`,
    changeOrigin: true,
    // proxyTimeout: 20000,
    // timeout: 20000,
  });

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

app.get("/*", async (req, res, ...args) => {
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

  if (req.url.includes("/_sample_.")) {
    try {
      return res.send(await buildLiveSamplePageFromURL(req.path));
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

  // TODO: Would be nice to have a list of all supported file extensions
  // in a constants file.
  if (/\.(png|webp|gif|jpe?g|svg)$/.test(req.path)) {
    // Remember, Image.findByURLWithFallback() will return the absolute file path
    // iff it exists on disk.
    // Using a "fallback" strategy here so that images embedded in live samples
    // are resolved if they exist in en-US but not in <locale>
    const filePath = Image.findByURLWithFallback(req.path);
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
  let bcdDataURL = "";
  let isMetadata = false;
  let isDocument = false;
  const bcdDataURLRegex = /\/(bcd-\d+|bcd)\.json$/;

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
  } else if (bcdDataURLRegex.test(req.path)) {
    bcdDataURL = req.path;
    lookupURL = lookupURL.replace(bcdDataURLRegex, "");
  }

  const isJSONRequest = extraSuffix.endsWith(".json");

  let document;
  let bcdData;
  try {
    console.time(`buildDocumentFromURL(${lookupURL})`);
    const built = await buildDocumentFromURL(lookupURL);
    if (built) {
      document = built.doc;
      bcdData = built.bcdData;
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

  if (bcdDataURL) {
    return res.json(
      bcdData.find((data) => data.url.toLowerCase() === bcdDataURL).data
    );
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
    res.send(renderHTML(lookupURL, { doc: document }));
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
