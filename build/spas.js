const fs = require("fs");
const path = require("path");
const frontmatter = require("front-matter");
// eslint-disable-next-line node/no-unpublished-require
const { marked } = require("marked");

const {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  VALID_LOCALES,
} = require("../content");
const { BUILD_OUT_ROOT } = require("./constants");
// eslint-disable-next-line node/no-missing-require
const { renderHTML } = require("../ssr/dist/main");
const { default: got } = require("got");

function getFeaturedContributor() {
  const prefix = "/en-us/contribute/spotlight";
  for (const root of [CONTRIBUTOR_SPOTLIGHT_ROOT]) {
    for (const contributor of fs.readdirSync(root)) {
      const markdown = fs.readFileSync(
        `${root}/${contributor}/index.md`,
        "utf8"
      );
      const frontMatter = frontmatter(markdown);

      if (frontMatter.attributes.is_featured) {
        return {
          contributorName: frontMatter.attributes.contributor_name,
          url: `${prefix}/${frontMatter.attributes.folder_name}`,
          quote: frontMatter.attributes.quote,
        };
      }
    }
  }
}

async function buildSPAs(options) {
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

  for (const root of [CONTRIBUTOR_SPOTLIGHT_ROOT]) {
    if (!root) {
      continue;
    }

    // for now, these will only be available in English
    const locale = "en-US";
    const prefix = "contribute/spotlight";

    for (const contributor of fs.readdirSync(root)) {
      const markdown = fs.readFileSync(
        `${root}/${contributor}/index.md`,
        "utf8"
      );
      const imgFile = fs.readFileSync(
        `${root}/${contributor}/profile-image.jpg`,
        "base64"
      );
      const frontMatter = frontmatter(markdown);
      const contributorHTML = marked(frontMatter.body);

      const context = {
        body: contributorHTML,
        contributorName: frontMatter.attributes.contributor_name,
        folderName: frontMatter.attributes.folder_name,
        isFeatured: frontMatter.attributes.is_featured,
        pageTitle: `Contributor Spotlight - ${frontMatter.attributes.contributor_name} - MDN Web Docs`,
        profileImg: frontMatter.attributes.profile_img[0],
        webLinks: frontMatter.attributes.web_links,
        quote: frontMatter.attributes.quote,
      };

      const html = renderHTML(url, context);
      const outPath = path.join(
        BUILD_OUT_ROOT,
        locale,
        `${prefix}/${context.folderName}`
      );
      const filePath = path.join(outPath, "index.html");
      const imgFilePath = path.join(outPath, "profile-image.jpg");
      const jsonFilePath = path.join(outPath, "index.json");

      fs.mkdirSync(outPath, { recursive: true });
      fs.writeFileSync(filePath, html);
      fs.writeFileSync(imgFilePath, imgFile, "base64");
      fs.writeFileSync(jsonFilePath, JSON.stringify(context));

      buildCount++;

      if (options.verbose) {
        console.log("Wrote", filePath);
      }
    }
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
        { prefix: "plus", pageTitle: "Plus", noIndexing: true },
        {
          prefix: "plus/collection",
          pageTitle: "Collection",
          noIndexing: true,
        },
        { prefix: "about", pageTitle: "About MDN" },
        { prefix: "contribute", pageTitle: "Contribute to MDN" },
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

  // Build all the home pages in all locales.
  // Fetch merged content PRs for the latest contribution section.
  const pullRequestsData = await got(
    "https://api.github.com/search/issues?q=repo:mdn/content+is:pr+is:merged+sort:updated&per_page=10"
  ).json();
  const featuredContributor = getFeaturedContributor();

  for (const root of [CONTENT_ROOT, CONTENT_TRANSLATED_ROOT]) {
    if (!root) {
      continue;
    }
    for (const locale of fs.readdirSync(root)) {
      if (locale === "jsondata") {
        // This is actually not a locale but it's located next to the locales.
        continue;
      }
      if (!fs.statSync(path.join(root, locale)).isDirectory()) {
        continue;
      }
      const url = `/${locale}/`;
      const context = {
        pullRequestsData: {
          items: pullRequestsData.items,
          repo: { name: "mdn/content", url: "https://github.com/mdn/content" },
        },
        featuredContributor,
      };
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

module.exports = { buildSPAs };
