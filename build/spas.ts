import fs from "fs";
import path from "path";
import frontmatter from "front-matter";

import { m2h } from "../markdown";

import { VALID_LOCALES, MDN_PLUS_TITLE } from "../libs/constants";
import {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  BUILD_OUT_ROOT,
} from "../libs/env";
// eslint-disable-next-line node/no-missing-require
import { renderHTML } from "../ssr/dist/main";
import { default as got } from "got";
import { splitSections } from "./utils";
import cheerio from "cheerio";
import { findByURL } from "../content/document";
import { buildDocument } from ".";
import { NewsItem } from "../client/src/homepage/latest-news";

export interface DocFrontmatter {
  contributor_name?: string;
  folder_name?: string;
  is_featured?: boolean;
  img_alt?: string;
  usernames?: any;
  quote?: any;
  title?: string;
  slug?: string;
  original_slug?: string;
}

const dirname = __dirname;

const FEATURED_ARTICLES = [
  "Web/CSS/Cascade",
  "Web/HTML/Element/dialog",
  "Learn/JavaScript/Asynchronous",
  "Web/API/Canvas_API/Tutorial",
];

const contributorSpotlightRoot = CONTRIBUTOR_SPOTLIGHT_ROOT;

async function buildContributorSpotlight(locale, options) {
  const prefix = "community/spotlight";
  const profileImg = "profile-image.jpg";

  for (const contributor of fs.readdirSync(contributorSpotlightRoot)) {
    const markdown = fs.readFileSync(
      `${contributorSpotlightRoot}/${contributor}/index.md`,
      "utf-8"
    );

    const frontMatter = frontmatter<DocFrontmatter>(markdown);
    const contributorHTML = await m2h(frontMatter.body, locale);

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
      locale,
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

export async function buildSPAs(options) {
  let buildCount = 0;

  // The URL isn't very important as long as it triggers the right route in the <App/>
  const url = "/en-US/404.html";
  const html = renderHTML(url, { pageNotFound: true });
  const outPath = path.join(BUILD_OUT_ROOT, "en-us", "_spas");
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
    for (const locale of fs.readdirSync(root)) {
      if (!fs.statSync(path.join(root, locale)).isDirectory()) {
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
          prefix: "plus/notifications",
          pageTitle: `Notifications | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        {
          prefix: "plus/notifications/starred",
          pageTitle: `Starred | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        {
          prefix: "plus/notifications/watched",
          pageTitle: `Watch list | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        {
          prefix: "plus/settings",
          pageTitle: `Settings | ${MDN_PLUS_TITLE}`,
          noIndexing: true,
        },
        { prefix: "about", pageTitle: "About MDN" },
        { prefix: "community", pageTitle: "Contribute to MDN" },
      ];
      for (const { prefix, pageTitle, noIndexing } of SPAs) {
        const url = `/${locale}/${prefix}`;
        const context = {
          pageTitle,
          locale: VALID_LOCALES.get(locale) || locale,
          noIndexing,
        };

        const html = renderHTML(url, context);
        const outPath = path.join(BUILD_OUT_ROOT, locale, prefix);
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
  async function buildStaticPages(dirpath, slug, title = "MDN") {
    for (const file of fs.readdirSync(dirpath)) {
      const filepath = path.join(dirpath, file);
      const stat = fs.lstatSync(filepath);
      const page = file.split(".")[0];

      if (stat.isDirectory()) {
        await buildStaticPages(filepath, `${slug}/${page}`, title);
        return;
      }

      const locale = "en-us";
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
    path.join(dirname, "../copy/plus"),
    "plus/docs",
    "MDN Plus"
  );

  // Build all the home pages in all locales.
  // Fetch merged content PRs for the latest contribution section.
  const pullRequestsData = (await got(
    "https://api.github.com/search/issues?q=repo:mdn/content+is:pr+is:merged+sort:updated&per_page=10"
  ).json()) as {
    items: any[];
  };

  // Fetch latest Hacks articles.
  const latestNews = await fetchLatestNews();

  for (const root of [CONTENT_ROOT, CONTENT_TRANSLATED_ROOT]) {
    if (!root) {
      continue;
    }
    for (const locale of fs.readdirSync(root)) {
      if (!VALID_LOCALES.has(locale)) {
        continue;
      }
      if (!fs.statSync(path.join(root, locale)).isDirectory()) {
        continue;
      }

      let featuredContributor = contributorSpotlightRoot
        ? await buildContributorSpotlight(locale, options)
        : null;

      const featuredArticles = (
        await Promise.all(
          FEATURED_ARTICLES.map(async (url) => {
            const document =
              findByURL(`/${locale}/docs/${url}`) ||
              findByURL(`/en-US/docs/${url}`);
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
        recentContributions: {
          items: pullRequestsData.items.map(
            ({ number, title, updated_at, pull_request: { html_url } }) => ({
              number,
              title,
              updated_at,
              url: html_url,
            })
          ),
          repo: { name: "mdn/content", url: "https://github.com/mdn/content" },
        },
        featuredContributor,
        latestNews,
        featuredArticles,
      };
      const context = { hyData };
      const html = renderHTML(url, context);
      const outPath = path.join(BUILD_OUT_ROOT, locale);
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

async function fetchLatestNews() {
  const xml = await got("https://hacks.mozilla.org/category/mdn/feed/").text();

  const $ = cheerio.load(xml, { xmlMode: true });

  const items: NewsItem[] = [];

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
