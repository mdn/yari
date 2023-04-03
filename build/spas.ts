import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import cheerio from "cheerio";
import frontmatter from "front-matter";
import { fdir, PathsOutput } from "fdir";
import got from "got";

import { m2h } from "../markdown/index.js";

import {
  VALID_LOCALES,
  MDN_PLUS_TITLE,
  DEFAULT_LOCALE,
} from "../libs/constants/index.js";
import {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  BUILD_OUT_ROOT,
} from "../libs/env/index.js";
import { isValidLocale } from "../libs/locale-utils/index.js";
import { DocFrontmatter, NewsItem } from "../libs/types/document.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { renderHTML } from "../ssr/dist/main.js";
import { splitSections } from "./utils.js";
import { findByURL } from "../content/document.js";
import { buildDocument } from "./index.js";

const FEATURED_ARTICLES = [
  "Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL",
  "Web/CSS/CSS_Container_Queries",
  "Web/API/Performance_API",
  "Web/CSS/font-palette",
];

const contributorSpotlightRoot = CONTRIBUTOR_SPOTLIGHT_ROOT;

async function buildContributorSpotlight(
  locale: string,
  options: { verbose?: boolean }
) {
  const prefix = "community/spotlight";
  const profileImg = "profile-image.jpg";

  for (const contributor of fs.readdirSync(contributorSpotlightRoot)) {
    const markdown = fs.readFileSync(
      `${contributorSpotlightRoot}/${contributor}/index.md`,
      "utf-8"
    );

    const frontMatter = frontmatter<DocFrontmatter>(markdown);
    const contributorHTML = await m2h(frontMatter.body, { locale });

    const { sections } = splitSections(contributorHTML);

    const hyData = {
      sections: sections,
      contributorName: frontMatter.attributes.contributor_name,
      folderName: frontMatter.attributes.folder_name,
      isFeatured: frontMatter.attributes.is_featured,
      profileImg,
      profileImgAlt: frontMatter.attributes.img_alt,
      usernames: frontMatter.attributes.usernames,
      quote: frontMatter.attributes.quote,
    };
    const context = { hyData };

    const html = renderHTML(`/${locale}/${prefix}/${contributor}`, context);
    const outPath = path.join(
      BUILD_OUT_ROOT,
      locale.toLowerCase(),
      `${prefix}/${hyData.folderName}`
    );
    const filePath = path.join(outPath, "index.html");
    const imgFilePath = `${contributorSpotlightRoot}/${contributor}/profile-image.jpg`;
    const imgFileDestPath = path.join(outPath, profileImg);
    const jsonFilePath = path.join(outPath, "index.json");

    fs.mkdirSync(outPath, { recursive: true });
    fs.writeFileSync(filePath, html);
    fs.copyFileSync(imgFilePath, imgFileDestPath);
    fs.writeFileSync(jsonFilePath, JSON.stringify(context));

    if (options.verbose) {
      console.log("Wrote", filePath);
    }
    if (frontMatter.attributes.is_featured) {
      return {
        contributorName: frontMatter.attributes.contributor_name,
        url: `/${locale}/${prefix}/${frontMatter.attributes.folder_name}`,
        quote: frontMatter.attributes.quote,
      };
    }
  }
}

export async function buildSPAs(options: {
  quiet?: boolean;
  verbose?: boolean;
}) {
  let buildCount = 0;

  // The URL isn't very important as long as it triggers the right route in the <App/>
  const url = `/${DEFAULT_LOCALE}/404.html`;
  const html = renderHTML(url, { pageNotFound: true });
  const outPath = path.join(
    BUILD_OUT_ROOT,
    DEFAULT_LOCALE.toLowerCase(),
    "_spas"
  );
  fs.mkdirSync(outPath, { recursive: true });
  fs.writeFileSync(path.join(outPath, path.basename(url)), html);
  buildCount++;
  if (options.verbose) {
    console.log("Wrote", path.join(outPath, path.basename(url)));
  }

  // Basically, this builds one (for example) `search/index.html` for every
  // locale we intend to build.
  for (const root of [CONTENT_ROOT, CONTENT_TRANSLATED_ROOT]) {
    if (!root) {
      continue;
    }
    for (const pathLocale of fs.readdirSync(root)) {
      if (!fs.statSync(path.join(root, pathLocale)).isDirectory()) {
        continue;
      }

      const SPAs = [
        { prefix: "search", pageTitle: "Search" },
        { prefix: "plus", pageTitle: MDN_PLUS_TITLE },
        {
          prefix: "plus/collections",
          pageTitle: `Collections | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        {
          prefix: "plus/collections/frequently_viewed",
          pageTitle: `Frequently viewed articles | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        {
          prefix: "plus/updates",
          pageTitle: `Updates | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        {
          prefix: "plus/settings",
          pageTitle: `Settings | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        { prefix: "about", pageTitle: "About MDN" },
        { prefix: "community", pageTitle: "Contribute to MDN" },
        {
          prefix: "advertising",
          pageTitle: "Advertise with us",
        },
      ];
      const locale = VALID_LOCALES.get(pathLocale) || pathLocale;
      for (const { prefix, pageTitle, noIndexing } of SPAs) {
        const url = `/${locale}/${prefix}`;
        const context = {
          pageTitle,
          locale,
          noIndexing,
        };

        const html = renderHTML(url, context);
        const outPath = path.join(BUILD_OUT_ROOT, pathLocale, prefix);
        fs.mkdirSync(outPath, { recursive: true });
        const filePath = path.join(outPath, "index.html");
        fs.writeFileSync(filePath, html);
        buildCount++;
        if (options.verbose) {
          console.log("Wrote", filePath);
        }
      }
    }
  }

  // Building the MDN Plus pages.

  /**
   *
   * @param {string} dirpath
   * @param {string} slug
   * @param {string} title
   */
  async function buildStaticPages(
    dirpath: string,
    slug: string,
    title = "MDN"
  ) {
    const crawler = new fdir()
      .withFullPaths()
      .withErrors()
      .filter((path) => path.endsWith(".md"))
      .crawl(dirpath);
    const filepaths = [...(crawler.sync() as PathsOutput)];

    for (const filepath of filepaths) {
      const file = filepath.replace(dirpath, "");
      const page = file.split(".")[0];

      const locale = DEFAULT_LOCALE.toLowerCase();
      const markdown = fs.readFileSync(filepath, "utf-8");

      const frontMatter = frontmatter<DocFrontmatter>(markdown);
      const rawHTML = await m2h(frontMatter.body, { locale });

      const { sections, toc } = splitSections(rawHTML);

      const url = `/${locale}/${slug}/${page}`;
      const hyData = {
        id: page,
        ...frontMatter.attributes,
        sections,
        toc,
      };
      const context = {
        hyData,
        pageTitle: `${frontMatter.attributes.title || ""} | ${title}`,
      };

      const html = renderHTML(url, context);
      const outPath = path.join(
        BUILD_OUT_ROOT,
        locale,
        ...slug.split("/"),
        page
      );
      fs.mkdirSync(outPath, { recursive: true });
      const filePath = path.join(outPath, "index.html");
      fs.writeFileSync(filePath, html);
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", filePath);
      }
      const filePathContext = path.join(outPath, "index.json");
      fs.writeFileSync(filePathContext, JSON.stringify(context));
    }
  }

  await buildStaticPages(
    fileURLToPath(new URL("../copy/plus/", import.meta.url)),
    "plus/docs",
    "MDN Plus"
  );

  // Build all the home pages in all locales.
  // Fetch merged content PRs for the latest contribution section.
  const recentContributions = await fetchRecentContributions();

  // Fetch latest Hacks articles.
  const latestNews = await fetchLatestNews();

  for (const root of [CONTENT_ROOT, CONTENT_TRANSLATED_ROOT]) {
    if (!root) {
      continue;
    }
    for (const localeLC of fs.readdirSync(root)) {
      const locale = VALID_LOCALES.get(localeLC) || localeLC;
      if (!isValidLocale(locale)) {
        continue;
      }
      if (!fs.statSync(path.join(root, localeLC)).isDirectory()) {
        continue;
      }

      const featuredContributor = contributorSpotlightRoot
        ? await buildContributorSpotlight(locale, options)
        : null;

      const featuredArticles = (
        await Promise.all(
          FEATURED_ARTICLES.map(async (url) => {
            const document =
              findByURL(`/${locale}/docs/${url}`) ||
              findByURL(`/${DEFAULT_LOCALE}/docs/${url}`);
            if (document) {
              const {
                doc: { mdn_url, summary, title, parents },
              } = await buildDocument(document);
              return {
                mdn_url,
                summary,
                title,
                tag: parents.length > 2 ? parents[1] : null,
              };
            }
          })
        )
      ).filter(Boolean);

      const url = `/${locale}/`;
      const hyData = {
        recentContributions,
        featuredContributor,
        latestNews,
        featuredArticles,
      };
      const context = { hyData };
      const html = renderHTML(url, context);
      const outPath = path.join(BUILD_OUT_ROOT, localeLC);
      fs.mkdirSync(outPath, { recursive: true });
      const filePath = path.join(outPath, "index.html");
      fs.writeFileSync(filePath, html);
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", filePath);
      }

      // Also, dump the recent pull requests in a file so the data can be gotten
      // in client-side rendering.
      const filePathContext = path.join(outPath, "index.json");
      fs.writeFileSync(filePathContext, JSON.stringify(context));
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", filePathContext);
      }
    }
  }

  if (!options.quiet) {
    console.log(`Built ${buildCount} SPA related files`);
  }
}

async function fetchGitHubPRs(repo, count = 5) {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const pullRequestsQuery = [
    `repo:${repo}`,
    "is:pr",
    "is:merged",
    `merged:>${twoDaysAgo.toISOString()}`,
    "sort:updated",
  ].join("+");
  const pullRequestUrl = `https://api.github.com/search/issues?q=${pullRequestsQuery}&per_page=${count}`;
  const pullRequestsData = (await got(pullRequestUrl).json()) as {
    items: any[];
  };
  const prDataRepo = pullRequestsData.items.map((item) => ({
    ...item,
    repo: { name: repo, url: `https://github.com/${repo}` },
  }));
  return prDataRepo;
}

async function fetchRecentContributions() {
  const repos = ["mdn/content", "mdn/translated-content"];
  const countPerRepo = 5;
  const pullRequests = (
    await Promise.all(
      repos.map(async (repo) => await fetchGitHubPRs(repo, countPerRepo))
    )
  ).flat();
  const pullRequestsData = pullRequests.sort((a, b) =>
    a.updated_at < b.updated_at ? 1 : -1
  );
  return {
    items: pullRequestsData.map(
      ({ number, title, updated_at, pull_request: { html_url }, repo }) => ({
        number,
        title,
        updated_at,
        url: html_url,
        repo,
      })
    ),
  };
}

async function fetchLatestNews() {
  const xml = await got("https://hacks.mozilla.org/category/mdn/feed/").text();

  const $ = cheerio.load(xml, { xmlMode: true });

  const items: NewsItem[] = [];

  items.push(
    {
      title: "Experimenting with advertising on MDN",
      url: `/${DEFAULT_LOCALE}/advertising`,
      author: "Mozilla",
      published_at: new Date("2023-02-15 15:00Z").toString(),
      source: {
        name: "developer.mozilla.org",
        url: "/",
      },
    },
    {
      title: "A shared and open roadmap for MDN",
      url: "https://blog.mozilla.org/en/mozilla/mdn-web-documentation-collaboration/",
      author: "Mozilla",
      published_at: new Date("2023-02-08").toString(),
      source: {
        name: "blog.mozilla.org",
        url: "https://blog.mozilla.org/",
      },
    }
  );

  $("item").each((i, item) => {
    const $item = $(item);

    items.push({
      title: $item.find("title").text(),
      url: $item.find("guid").text(),
      author: $item.find("dc\\:creator").text(),
      published_at: $item.find("pubDate").text(),
      source: {
        name: "hacks.mozilla.org",
        url: "https://hacks.mozilla.org/category/mdn/",
      },
    });
  });

  return {
    items,
  };
}
