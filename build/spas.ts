import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  DEV_MODE,
} from "../libs/env/index.js";
import { isValidLocale } from "../libs/locale-utils/index.js";
import { DocFrontmatter, DocParent, NewsItem } from "../libs/types/document.js";
import { getSlugByBlogPostUrl, splitSections } from "./utils.js";
import { findByURL } from "../content/document.js";
import { buildDocument } from "./index.js";
import { findPostBySlug } from "./blog.js";

const FEATURED_ARTICLES = [
  "blog/learn-javascript-console-methods/",
  "blog/introduction-to-web-sustainability/",
  "docs/Web/API/CSS_Custom_Highlight_API",
  "docs/Web/CSS/color_value",
];

const LATEST_NEWS: (NewsItem | string)[] = [
  "blog/mdn-curriculum-launch/",
  "blog/baseline-evolution-on-mdn/",
  "blog/introducing-the-mdn-playground/",
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
    const context = { hyData, url: `/${locale}/${prefix}/${contributor}` };

    const outPath = path.join(
      BUILD_OUT_ROOT,
      locale.toLowerCase(),
      `${prefix}/${hyData.folderName}`
    );
    const imgFilePath = `${contributorSpotlightRoot}/${contributor}/profile-image.jpg`;
    const imgFileDestPath = path.join(outPath, profileImg);
    const jsonFilePath = path.join(outPath, "index.json");

    fs.mkdirSync(outPath, { recursive: true });
    fs.copyFileSync(imgFilePath, imgFileDestPath);
    fs.writeFileSync(jsonFilePath, JSON.stringify(context));

    if (options.verbose) {
      console.log("Wrote", jsonFilePath);
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
  const context = { url, pageNotFound: true };
  const outPath = path.join(
    BUILD_OUT_ROOT,
    DEFAULT_LOCALE.toLowerCase(),
    "_spas"
  );
  fs.mkdirSync(outPath, { recursive: true });
  const jsonFilePath = path.join(
    outPath,
    path.basename(url).replace(/\.html$/, ".json")
  );
  fs.writeFileSync(jsonFilePath, JSON.stringify(context));
  buildCount++;
  if (options.verbose) {
    console.log("Wrote", jsonFilePath);
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
        { prefix: "play", pageTitle: "Playground | MDN" },
        { prefix: "search", pageTitle: "Search" },
        { prefix: "plus", pageTitle: MDN_PLUS_TITLE },
        {
          prefix: "plus/ai-help",
          pageTitle: `AI Help | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
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
        {
          prefix: "newsletter",
          pageTitle: "Stay Informed with MDN",
        },
      ];
      const locale = VALID_LOCALES.get(pathLocale) || pathLocale;
      for (const { prefix, pageTitle, noIndexing } of SPAs) {
        const url = `/${locale}/${prefix}`;
        const context = {
          pageTitle,
          locale,
          noIndexing,
          url,
        };

        const outPath = path.join(BUILD_OUT_ROOT, pathLocale, prefix);
        fs.mkdirSync(outPath, { recursive: true });
        const jsonFilePath = path.join(outPath, "index.json");
        fs.writeFileSync(jsonFilePath, JSON.stringify(context));
        buildCount++;
        if (options.verbose) {
          console.log("Wrote", jsonFilePath);
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
        url,
      };

      const outPath = path.join(
        BUILD_OUT_ROOT,
        locale,
        ...slug.split("/"),
        page
      );
      fs.mkdirSync(outPath, { recursive: true });
      const jsonFilePath = path.join(outPath, "index.json");
      fs.writeFileSync(jsonFilePath, JSON.stringify(context));
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", jsonFilePath);
      }
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
            const segment = url.split("/")[0];
            if (segment === "docs") {
              const document =
                findByURL(`/${locale}/${url}`) ||
                findByURL(`/${DEFAULT_LOCALE}/${url}`);
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
            } else if (segment === "blog") {
              const post = await findPostBySlug(
                getSlugByBlogPostUrl(`/${DEFAULT_LOCALE}/${url}`)
              );
              if (post) {
                const {
                  doc: { title },
                  blogMeta: { description, slug },
                } = post;
                return {
                  mdn_url: `/${DEFAULT_LOCALE}/blog/${slug}/`,
                  summary: description,
                  title,
                  tag: {
                    uri: `/${DEFAULT_LOCALE}/blog/`,
                    title: "Blog",
                  } satisfies DocParent,
                };
              }
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
      const context = { hyData, url };
      const outPath = path.join(BUILD_OUT_ROOT, localeLC);
      fs.mkdirSync(outPath, { recursive: true });

      const jsonFilePath = path.join(outPath, "index.json");
      fs.writeFileSync(jsonFilePath, JSON.stringify(context));
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", jsonFilePath);
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
  try {
    const pullRequestsData = (await got(pullRequestUrl).json()) as {
      items: any[];
    };
    const prDataRepo = pullRequestsData.items.map((item) => ({
      ...item,
      repo: { name: repo, url: `https://github.com/${repo}` },
    }));
    return prDataRepo;
  } catch (e) {
    const msg = `Couldn't fetch recent GitHub contributions for repo ${repo}!`;
    if (!DEV_MODE) {
      console.error(`Error: ${msg}`);
      throw e;
    }

    console.warn(`Warning: ${msg}`);
    return [];
  }
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
  const items: NewsItem[] = (
    await Promise.all(
      LATEST_NEWS.map(async (itemOrUrl) => {
        if (typeof itemOrUrl !== "string") {
          return itemOrUrl;
        }
        const url = itemOrUrl;
        const post = await findPostBySlug(
          getSlugByBlogPostUrl(`/${DEFAULT_LOCALE}/${url}`)
        );
        if (post) {
          const {
            doc: { title },
            blogMeta: { author, date, slug },
          } = post;
          return {
            title,
            url: `/${DEFAULT_LOCALE}/blog/${slug}/`,
            author: author?.name || "The MDN Team",
            published_at: new Date(date).toString(),
            source: {
              name: "developer.mozilla.org",
              url: `/${DEFAULT_LOCALE}/blog/`,
            },
          };
        }
      })
    )
  ).filter(Boolean);

  return {
    items,
  };
}
