import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import frontmatter from "front-matter";
import { fdir, PathsOutput } from "fdir";
import got from "got";
import { Octokit } from "octokit";

import { m2h } from "../markdown/index.js";

import {
  VALID_LOCALES,
  MDN_PLUS_TITLE,
  DEFAULT_LOCALE,
  OBSERVATORY_TITLE_FULL,
  OBSERVATORY_TITLE,
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
import { buildSitemap } from "./sitemaps.js";
import { type Locale } from "../libs/types/core.js";
import { HydrationData } from "../libs/types/hydration.js";

const FEATURED_ARTICLES = [
  "blog/learn-javascript-console-methods/",
  "blog/introduction-to-web-sustainability/",
  "docs/Web/API/CSS_Custom_Highlight_API",
  "docs/Web/CSS/color_value",
];

const LATEST_NEWS: (NewsItem | string)[] = [
  "blog/mdn-http-observatory-launch/",
  "blog/mdn-curriculum-launch/",
  "blog/baseline-evolution-on-mdn/",
  "blog/introducing-the-mdn-playground/",
];

const PAGE_DESCRIPTIONS = Object.freeze({
  observatory:
    "Test your site’s HTTP headers, including CSP and HSTS, to find security problems and get actionable recommendations to make your website more secure. Test other websites to see how you compare.",
});

const contributorSpotlightRoot = CONTRIBUTOR_SPOTLIGHT_ROOT;

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function buildContributorSpotlight(
  locale: Locale,
  options: { verbose?: boolean },
  onlyFeatured = true
) {
  // TODO: cache/optimize
  const prefix = "community/spotlight";
  const profileImg = "profile-image.jpg";

  const spotlights = await Promise.all(
    fs.readdirSync(contributorSpotlightRoot).map(async (contributor) => {
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
      const context: HydrationData = {
        hyData,
        url: `/${locale}/${prefix}/${contributor}`,
      };

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
      return {
        contributorName: frontMatter.attributes.contributor_name,
        url: `/${locale}/${prefix}/${frontMatter.attributes.folder_name}`,
        quote: frontMatter.attributes.quote,
        isFeatured: frontMatter.attributes.is_featured,
      };
    })
  );

  if (onlyFeatured) {
    const { contributorName, url, quote } = spotlights.find(
      ({ isFeatured }) => isFeatured
    );
    return { contributorName, url, quote };
  } else {
    return spotlights;
  }
}

export async function buildSPAs(options: {
  quiet?: boolean;
  verbose?: boolean;
}) {
  let buildCount = 0;
  const sitemap: {
    url: string;
  }[] = [];

  // The URL isn't very important as long as it triggers the right route in the <App/>
  const locale = DEFAULT_LOCALE;
  const url = `/${locale}/404.html`;
  const context: HydrationData = { url, pageNotFound: true };
  const outPath = path.join(BUILD_OUT_ROOT, locale.toLowerCase(), "_spas");
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
      if (
        !fs.statSync(path.join(root, pathLocale)).isDirectory() ||
        !isValidLocale(pathLocale)
      ) {
        continue;
      }
      const locale = VALID_LOCALES.get(pathLocale) || (pathLocale as Locale);

      const SPAs = [
        { prefix: "play", pageTitle: "Playground | MDN" },
        {
          prefix: "observatory",
          pageTitle: `HTTP Header Security Test - ${OBSERVATORY_TITLE_FULL}`,
          pageDescription: PAGE_DESCRIPTIONS.observatory,
        },
        {
          prefix: "observatory/analyze",
          pageTitle: `Scan results - ${OBSERVATORY_TITLE_FULL}`,
          pageDescription: PAGE_DESCRIPTIONS.observatory,
          noIndexing: true,
        },
        {
          prefix: "observatory/docs/tests_and_scoring",
          pageTitle: `Tests & Scoring - ${OBSERVATORY_TITLE_FULL}`,
          pageDescription: PAGE_DESCRIPTIONS.observatory,
        },
        {
          prefix: "observatory/docs/faq",
          pageTitle: `FAQ - ${OBSERVATORY_TITLE_FULL}`,
          pageDescription: PAGE_DESCRIPTIONS.observatory,
        },
        { prefix: "search", pageTitle: "Search", onlyFollow: true },
        { prefix: "plus", pageTitle: MDN_PLUS_TITLE },
        {
          prefix: "plus/ai-help",
          pageTitle: `AI Help | ${MDN_PLUS_TITLE}`,
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
        },
        {
          prefix: "plus/settings",
          pageTitle: `Settings | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        { prefix: "about", pageTitle: "About MDN" },
        {
          prefix: "community",
          pageTitle: "Contribute to MDN",
          hyData: async () => ({
            // TODO cache across locales
            recentContributors: await fetchRecentContributors(),
            contributorSpotlight: contributorSpotlightRoot
              ? await buildContributorSpotlight(locale, options, false)
              : null,
            goodFirstIssues: await fetchGoodFirstIssues(),
            recentContributions: await fetchRecentContributions(),
          }),
        },
        {
          prefix: "advertising",
          pageTitle: "Advertise with us",
        },
        {
          prefix: "newsletter",
          pageTitle: "Stay Informed with MDN",
        },
      ];
      for (const {
        prefix,
        pageTitle,
        pageDescription,
        noIndexing,
        onlyFollow,
        hyData,
      } of SPAs) {
        const url = `/${locale}/${prefix}`;
        const context: HydrationData = {
          pageTitle,
          pageDescription,
          locale,
          noIndexing,
          onlyFollow,
          url,
        };

        if (hyData) {
          context.hyData = await hyData();
        }

        const outPath = path.join(BUILD_OUT_ROOT, pathLocale, prefix);
        fs.mkdirSync(outPath, { recursive: true });
        const jsonFilePath = path.join(outPath, "index.json");
        fs.writeFileSync(jsonFilePath, JSON.stringify(context));
        buildCount++;
        if (options.verbose) {
          console.log("Wrote", jsonFilePath);
        }

        if (!noIndexing && !onlyFollow) {
          sitemap.push({
            url,
          });
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

      const locale = DEFAULT_LOCALE;
      const pathLocale = locale.toLowerCase();
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
      const context: HydrationData = {
        hyData,
        pageTitle: `${frontMatter.attributes.title || ""} | ${title}`,
        url,
      };

      const outPath = path.join(
        BUILD_OUT_ROOT,
        pathLocale,
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
      const filePathContext = path.join(outPath, "index.json");
      fs.writeFileSync(filePathContext, JSON.stringify(context));

      sitemap.push({
        url,
      });
    }
  }

  await buildStaticPages(
    fileURLToPath(new URL("../copy/plus/", import.meta.url)),
    "plus/docs",
    "MDN Plus"
  );
  await buildStaticPages(
    fileURLToPath(new URL("../copy/observatory/", import.meta.url)),
    "observatory/docs",
    OBSERVATORY_TITLE
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
      const locale = VALID_LOCALES.get(localeLC) || (localeLC as Locale);
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
      const context: HydrationData = { hyData, url };
      const outPath = path.join(BUILD_OUT_ROOT, localeLC);
      fs.mkdirSync(outPath, { recursive: true });

      sitemap.push({
        url,
      });

      // Also, dump the recent pull requests in a file so the data can be gotten
      // in client-side rendering.
      const jsonFilePath = path.join(outPath, "index.json");
      fs.writeFileSync(jsonFilePath, JSON.stringify(context));
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", jsonFilePath);
      }
    }
  }

  // Sitemap.
  const sitemapFilePath = await buildSitemap(
    sitemap.map(({ url }) => ({
      slug: url,
      modified: "",
    })),
    { pathSuffix: ["misc"] }
  );

  if (!options.quiet) {
    console.log("Wrote", sitemapFilePath);
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

async function* fetchGitHubPR(repo: string) {
  try {
    const prIterator = octokit.paginate.iterator(octokit.rest.pulls.list, {
      owner: "mdn",
      repo,
      state: "closed",
      sort: "updated",
      direction: "desc",
    });
    for await (const { data } of prIterator) {
      for (const pullRequest of data) {
        if (pullRequest.merged_at) {
          // TODO: this doesn't return PRs in merged order, but updated order
          // return in merged order by looking ahead until updated_at === merged_at
          // alternatively see if search API can return by merged order
          yield pullRequest;
        }
      }
    }
  } catch (e) {
    const msg = `Couldn't fetch recent GitHub contributions for repo ${repo}!`;
    if (!DEV_MODE) {
      console.error(`Error: ${msg}`);
      throw e;
    }

    console.warn(`Warning: ${msg}`);
  }
}

async function* mergeSortedIterators<T, TReturn>(
  iterators: AsyncIterator<T, TReturn>[],
  sorter: (a: T, b: T) => number
) {
  const sortedValues = (
    await Promise.all(
      iterators.map(async (generator, index) => {
        const { done, value } = await generator.next();
        if (!done) {
          return {
            value: value as T,
            index,
          };
        }
      })
    )
  ).filter((x) => x);

  while (sortedValues.length > 0) {
    sortedValues.sort((a, b) => sorter(a.value, b.value));
    const { value, index } = sortedValues.shift();
    yield value;
    const { done, value: nextValue } = await iterators[index].next();
    if (!done) {
      sortedValues.push({
        value: nextValue as T,
        index,
      });
    }
  }
}

// TODO: define this somewhere the client can access
interface Contributor {
  name: string;
  org_name: string;
  avatar_url: string;
}

async function fetchRecentContributors(count = 10) {
  const repos = ["content", "translated-content"];
  const contributors = new Map<string, Contributor>();
  for await (const pr of mergeSortedIterators(
    repos.map((repo) => fetchGitHubPR(repo)),
    (a, b) => (a.updated_at < b.updated_at ? 1 : -1)
  )) {
    // TODO: filter out Mozilla staff
    const { login, avatar_url } = pr.user;
    // TODO: use org rather than company, filter out Mozilla
    const {
      data: { name, company },
    } = await octokit.rest.users.getByUsername({ username: login });
    contributors.set(login, {
      name,
      org_name: company,
      avatar_url,
    });
    if (contributors.size >= count) {
      break;
    }
  }
  return [...contributors.values()];
}

async function fetchGoodFirstIssues(count = 10) {
  const { data } = await octokit.rest.search.issuesAndPullRequests({
    q: `is:open is:issue repo:mdn/content label:"good first issue","accepting PR" sort:created-asc no:assignee`,
    per_page: count,
  });
  // TODO: cull data
  return data;
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
