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
  ANY_ATTACHMENT_EXT,
  CSP_VALUE,
  DEFAULT_LOCALE,
} from "../libs/constants/index.js";
import {
  STATIC_ROOT,
  PROXY_HOSTNAME,
  FAKE_V1_API,
  CONTENT_HOSTNAME,
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  BLOG_ROOT,
  CURRICULUM_ROOT,
  EXTERNAL_DEV_SERVER,
  RARI,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
} from "../libs/env/index.js";
import { PLAYGROUND_UNSAFE_CSP_VALUE } from "../libs/play/index.js";

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
  findPostBySlug,
  findPostPathBySlug,
} from "../build/blog.js";
import { findCurriculumPageBySlug } from "../build/curriculum.js";
import { handleRunner } from "../libs/play/index.js";

async function fetch_from_rari(path: string) {
  const external_url = `${EXTERNAL_DEV_SERVER}${path}`;
  console.log(`using ${external_url}`);
  const response = await fetchWithRetryIfConnRefused(external_url, 5);
  return await response.json();
}

// Simulates `curl --retry-connrefused`.
async function fetchWithRetryIfConnRefused(
  url: string,
  maxRetries: number,
  baseDelay = 1000
) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`failed with HTTP ${response.status}`);
      }
      return response;
    } catch (error: any) {
      attempt++;
      if (
        error.code !== "ECONNREFUSED" &&
        error.cause?.code !== "ECONNREFUSED"
      ) {
        throw error;
      }

      console.log(`retrying ${attempt}/${maxRetries}`);
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw new Error(
          `failed after ${maxRetries} attempts: ${error.message}`
        );
      }
    }
  }
}

async function buildDocumentFromURL(url: string) {
  try {
    console.time(`buildDocumentFromURL(${url})`);
    let built;
    if (!RARI) {
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
      built = await buildDocument(document, documentOptions);
      if (built) {
        return { doc: built?.doc, url };
      }
    } else {
      built = await fetch_from_rari(url);
      if (built) {
        return built;
      }
    }
    if (
      url.split("/")[1] &&
      url.split("/")[1].toLowerCase() !== DEFAULT_LOCALE.toLowerCase() &&
      !CONTENT_TRANSLATED_ROOT
    ) {
      // Such a common mistake. You try to view a URL that is not en-US but
      // you forgot to set CONTENT_TRANSLATED_ROOT.
      console.warn(
        `URL is for locale '${
          url.split("/")[1]
        }' but CONTENT_TRANSLATED_ROOT is not set. URL will 404.`
      );
    }
  } catch (error) {
    console.error(`Error in buildDocumentFromURL(${url})`, error);
    throw error;
  } finally {
    console.timeEnd(`buildDocumentFromURL(${url})`);
  }
}

async function redirectOr404(res: express.Response, url, suffix = "") {
  const redirectURL = Redirect.resolve(url);
  if (redirectURL !== url) {
    // This was and is broken for redirects with anchors...
    return res.redirect(301, redirectURL + suffix);
  }
  return await send404(res);
}

async function send404(res: express.Response) {
  if (!RARI) {
    return res
      .status(404)
      .sendFile(path.join(STATIC_ROOT, "en-us", "404", "index.html"));
  } else {
    try {
      const index = await fetch_from_rari("/en-US/404");
      res.header("Content-Security-Policy", CSP_VALUE);
      return res.send(renderHTML(index));
    } catch (error) {
      return res.status(500).json(JSON.stringify(error.toString()));
    }
  }
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

app.use(express.json());

// Needed because we read cookies in the code that mimics what we do in Lambda@Edge.
app.use(cookieParser());

app.use(originRequestMiddleware);

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

if (!RARI) {
  app.use("/:locale/search-index.json", searchIndexRoute);
} else {
  app.use("/:locale/search-index.json", async (req, res) => {
    const { locale } = req.params;
    try {
      const json = await fetch_from_rari(`/${locale}/search-index.json`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.json(json);
    } catch (error) {
      return res.status(500).json(JSON.stringify(error.toString()));
    }
  });
}

app.get("/_flaws", flawsRoute);

app.use("/_translations", translationsRouter);

app.get("/*/contributors.txt", async (req, res) => {
  if (!RARI) {
    const url = req.path.replace(/\/contributors\.txt$/, "");
    const document = Document.findByURL(url);
    res.setHeader("content-type", "text/plain");
    if (!document) {
      return res.status(404).send(`Document not found by URL (${url})`);
    }
    try {
      const { doc: builtDocument } = await buildDocument(document);
      res.send(
        renderContributorsTxt(
          document.metadata.contributors,
          builtDocument.source.github_url.replace("/blob/", "/commits/")
        )
      );
    } catch (error) {
      return res.status(500).json(JSON.stringify(error.toString()));
    }
  } else {
    try {
      const external_url = `${EXTERNAL_DEV_SERVER}${req.path}`;
      console.log(`contributors.txt: using ${external_url}`);
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      const text = await (await fetch(external_url)).text();
      res.setHeader("content-type", "text/plain");
      return res.send(text);
    } catch (error) {
      return res.status(500).json(JSON.stringify(error.toString()));
    }
  }
});

app.get(["/*/runner.html", "/runner.html"], (req, res) => {
  handleRunner(req, res);
});

app.get(
  "/shared-assets/*",
  createProxyMiddleware({
    target: "https://mdn.github.io/shared-assets/",
    pathRewrite: {
      "^/shared-assets/": "/",
    },
    changeOrigin: true,
    autoRewrite: true,
    xfwd: true,
  })
);

if (CURRICULUM_ROOT) {
  app.get(
    [
      "/:locale/curriculum/:slug([\\S\\/]+)/index.json",
      "/:locale/curriculum/index.json",
    ],
    async (req, res) => {
      let data;
      if (!RARI) {
        const { slug = "" } = req.params;
        data = await findCurriculumPageBySlug(slug);
      } else {
        try {
          data = await fetch_from_rari(req.path.replace(/index\.json$/, ""));
        } catch (error) {
          return res.status(500).json(JSON.stringify(error.toString()));
        }
      }
      if (!data) {
        return res.status(404).send("Nothing here 🤷‍♂️");
      }
      return res.json(data);
    }
  );
} else {
  app.get("/[^/]+/curriculum/*", async (_, res) => {
    console.warn("'CURRICULUM_ROOT' not set in .env file");
    return await send404(res);
  });
}

if (BLOG_ROOT) {
  app.get("/:locale/blog/index.json", async (req, res) => {
    if (!RARI) {
      const posts = await allPostFrontmatter(
        { includeUnpublished: true },
        MEMOIZE_INVALIDATE
      );
      return res.json({ hyData: { posts } });
    } else {
      try {
        const index = await fetch_from_rari(
          req.path.replace(/index\.json$/, "")
        );
        return res.json(index);
      } catch (error) {
        return res.status(500).json(JSON.stringify(error.toString()));
      }
    }
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
  app.get("/:locale/blog/:slug/index.json", async (req, res) => {
    if (!RARI) {
      const { slug } = req.params;
      const data = await findPostBySlug(slug);
      if (!data) {
        return res.status(404).send("Nothing here 🤷‍♂️");
      }
      return res.json(data);
    } else {
      try {
        const index = await fetch_from_rari(
          req.path.replace(/index\.json$/, "")
        );
        return res.json(index);
      } catch (error) {
        return res.status(500).json(JSON.stringify(error.toString()));
      }
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
  app.get("/[^/]+/blog/*", async (_, res) => {
    console.warn("'BLOG_ROOT' not set in .env file");
    return await send404(res);
  });
}

if (contentProxy) {
  app.get("/*", async (req, res, ...args) => {
    console.log(`proxying: ${req.url}`);
    return contentProxy(req, res, ...args);
  });
} else {
  app.get("/*/_sample_.*", async (req, res) => {
    try {
      return res
        .setHeader("Content-Security-Policy", PLAYGROUND_UNSAFE_CSP_VALUE)
        .status(200)
        .send(await buildLiveSamplePageFromURL(req.path));
    } catch (e) {
      return res.status(404).send(e.toString());
    }
  });
  app.get("/[^/]+/docs/*/index.json", async (req, res) => {
    const url = decodeURI(req.path.replace(/\/index\.json$/, ""));
    try {
      const doc = await buildDocumentFromURL(url);
      if (!doc) {
        return await redirectOr404(res, url, "/index.json");
      }
      return res.json(doc);
    } catch (error) {
      return res.status(500).json(JSON.stringify(error.toString()));
    }
  });
  app.get("/[^/]+/docs/*/metadata.json", async (req, res) => {
    const url = decodeURI(req.path.replace(/\/metadata.json$/, ""));
    const doc = await buildDocumentFromURL(url);
    if (!doc?.doc) {
      return await redirectOr404(res, url, "/metadata.json");
    }
    const docString = JSON.stringify(doc);

    const hash = crypto.createHash("sha256").update(docString).digest("hex");
    const { body: _, toc: __, sidebarHTML: ___, ...builtMetadata } = doc.doc;
    builtMetadata.hash = hash;

    return res.json(builtMetadata);
  });
  app.get(
    `/[^/]+/docs/*/*.(${ANY_ATTACHMENT_EXT.join("|")})`,
    async (req, res) => {
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
  );
  app.get("/[^/]+/docs/*", async (req, res) => {
    const url = req.path;
    try {
      const doc = await buildDocumentFromURL(url);
      if (!doc) {
        return await redirectOr404(res, url);
      }
      res.header("Content-Security-Policy", CSP_VALUE);
      return res.send(renderHTML(doc));
    } catch (error) {
      return res.status(500).json(JSON.stringify(error.toString()));
    }
  });
}

if (RARI) {
  app.get(
    "/:locale/community/spotlight/:name/:asset(.+(jpg|png))",
    async (req, res) => {
      const { name, asset } = req.params;
      return send(
        req,
        path.resolve(
          CONTRIBUTOR_SPOTLIGHT_ROOT,
          sanitizeFilename(name),
          sanitizeFilename(asset)
        )
      ).pipe(res);
    }
  );
  app.get(
    [
      "/en-US/about",
      "/en-US/about/index.json",
      "/en-US/community",
      "/en-US/community/*",
      "/en-US/plus/docs/*",
      "/en-US/observatory/docs/*",
    ],
    async (req, res) => {
      try {
        const index = await fetch_from_rari(
          req.path.replace(/\/index\.json$/, "")
        );
        if (req.path.endsWith(".json")) {
          return res.json(index);
        }
        res.header("Content-Security-Policy", CSP_VALUE);
        return res.send(renderHTML(index));
      } catch (error) {
        return res.status(500).json(JSON.stringify(error.toString()));
      }
    }
  );
  app.get(
    [
      "/:locale([a-z]{2}(?:(?:-[A-Z]{2})?))/",
      "/:locale([a-z]{2}(?:(?:-[A-Z]{2})?))/index.json",
    ],
    async (req, res) => {
      try {
        const index = await fetch_from_rari(
          req.path.replace(/index\.json$/, "")
        );
        if (req.path.endsWith(".json")) {
          return res.json(index);
        }
        res.header("Content-Security-Policy", CSP_VALUE);
        return res.send(renderHTML(index));
      } catch (error) {
        return res.status(500).json(JSON.stringify(error.toString()));
      }
    }
  );
}

app.use(staticMiddlewares);

app.get("/*", async (_, res) => await send404(res));

console.warn("\n🗑️  This command is deprecated, and will be removed soon.\n");

if (!fs.existsSync(path.resolve(CONTENT_ROOT))) {
  throw new Error(`${path.resolve(CONTENT_ROOT)} does not exist!`);
}

console.log(
  `CONTENT_ROOT: ${chalk.bold(CONTENT_ROOT)}`,
  path.resolve(CONTENT_ROOT) !== CONTENT_ROOT
    ? chalk.grey(`(absolute path: ${path.resolve(CONTENT_ROOT)})`)
    : ""
);

const HOST = process.env.SERVER_HOST || undefined;
const PORT = parseInt(process.env.SERVER_PORT || "5042");
app.listen(PORT, HOST, () => {
  console.log(`Listening on ${HOST ? `${HOST}:` : "port "}${PORT}`);
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
