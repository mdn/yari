import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { fdir } from "fdir";
import { Feed } from "feed";
import frontmatter from "front-matter";

import * as kumascript from "../kumascript/index.js";

import LANGUAGES_RAW from "../libs/languages/index.js";
import { BLOG_ROOT, BUILD_OUT_ROOT, BASE_URL } from "../libs/env/index.js";
import { BlogPostData, BlogPostFrontmatter } from "../libs/types/blog.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { renderHTML } from "../ssr/dist/main.js";
import {
  findPostFileBySlug,
  injectLoadingLazyAttributes,
  injectNoTranslate,
  makeTOC,
  postLocalFileLinks,
  postProcessExternalLinks,
  postProcessSmallerHeadingIDs,
} from "./utils.js";
import { slugToFolder } from "../libs/slug-utils/index.js";
import { syntaxHighlight } from "./syntax-highlight.js";
import { wrapTables } from "./wrap-tables.js";
import { Doc } from "../libs/types/document.js";
import { extractSections } from "./extract-sections.js";
import { HydrationData } from "../libs/types/hydration.js";
import { DEFAULT_LOCALE } from "../libs/constants/index.js";

const READ_TIME_FILTER = /[\w<>.,!?]+/;

function calculateReadTime(copy: string): number {
  return Math.max(
    1,
    Math.round(
      copy.split(/\s+/).filter((w) => READ_TIME_FILTER.test(w)).length / 220
    )
  );
}

async function readPost(
  file: string
): Promise<{ blogMeta: BlogPostFrontmatter; body: string }> {
  const raw = await fs.readFile(file, "utf-8");

  const { attributes, body } = frontmatter<BlogPostFrontmatter>(raw);
  const readTime = calculateReadTime(body);
  return { blogMeta: { readTime, ...attributes }, body };
}

export function findPostPathBySlug(slug: string): string | null {
  const file = findPostFileBySlug(slug);
  if (!file) {
    return null;
  }
  return path.dirname(file);
}

export async function findPostLiveSampleBySlug(
  slug: string,
  id: string
): Promise<string | null> {
  const file = findPostFileBySlug(slug);
  if (!file) {
    return null;
  }
  const { blogMeta, body } = await readPost(file);

  const url = `/${DEFAULT_LOCALE}/blog/${blogMeta.slug}`;
  const { liveSamples } = await buildPost({
    url,
    rawBody: body,
    metadata: { locale: DEFAULT_LOCALE, ...blogMeta },
    isMarkdown: true,
  });
  return liveSamples.find((page) => page.id.toLowerCase() === id)?.html;
}

export async function findPostBySlug(
  slug: string
): Promise<BlogPostData | null> {
  const file = findPostFileBySlug(slug);
  if (!file) {
    return null;
  }
  const { blogMeta, body } = await readPost(file);

  const url = `/${DEFAULT_LOCALE}/blog/${blogMeta.slug}`;
  const { doc } = await buildPost({
    url,
    rawBody: body,
    metadata: { locale: DEFAULT_LOCALE, ...blogMeta },
    isMarkdown: true,
  });
  return { doc, blogMeta };
}

async function allPostFiles(): Promise<string[]> {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .filter((filePath) => filePath.endsWith("index.md"))
    .crawl(BLOG_ROOT);
  return await api.withPromise();
}

export async function allPostFrontmatter({
  includeUnpublished,
}: { includeUnpublished?: boolean } = {}): Promise<BlogPostFrontmatter[]> {
  return (
    await Promise.all(
      (
        await allPostFiles()
      ).map(async (file) => {
        return (await readPost(file)).blogMeta;
      })
    )
  )
    .filter(
      ({ published = true, date }) =>
        includeUnpublished || (published && Date.parse(date) <= Date.now())
    )
    .sort(({ date: a }, { date: b }) => (a > b ? -1 : a < b ? 1 : 0));
}

export async function buildBlogIndex(options: { verbose?: boolean }) {
  const prefix = "blog";
  const locale = DEFAULT_LOCALE;

  const hyData = {
    posts: await allPostFrontmatter(),
  };
  const context = { hyData, pageTitle: "MDN Blog" };

  const html = renderHTML(`/${locale}/${prefix}/`, context);
  const outPath = path.join(BUILD_OUT_ROOT, locale.toLowerCase(), `${prefix}`);

  await fs.mkdir(outPath, { recursive: true });
  const filePath = path.join(outPath, "index.html");
  const jsonFilePath = path.join(outPath, "index.json");

  await fs.mkdir(outPath, { recursive: true });
  await fs.writeFile(filePath, html);
  await fs.writeFile(jsonFilePath, JSON.stringify(context));

  if (options.verbose) {
    console.log("Wrote", filePath);
  }
}

export async function buildBlogPosts(options: {
  verbose?: boolean;
  noIndexing?: boolean;
}) {
  const prefix = "blog";
  const locale = DEFAULT_LOCALE;

  for (const file of await allPostFiles()) {
    const dirname = path.dirname(file);
    console.log(`building: ${file}`);

    const { blogMeta, body } = await readPost(file);

    const { published = true, date } = blogMeta;
    if (!published || Date.now() < Date.parse(date)) {
      console.log(`skipped: ${file} (unpublished or date in the future)`);
      continue;
    }

    const url = `/${locale}/blog/${blogMeta.slug}/`;
    const renderUrl = `/${locale}/blog/${blogMeta.slug}`;
    const renderDoc = {
      url: renderUrl,
      rawBody: body,
      metadata: { locale, ...blogMeta },
      isMarkdown: true,
    };
    const { doc: builtDoc, liveSamples } = await buildPost(renderDoc);
    const { doc } = {
      doc: { ...builtDoc, summary: blogMeta.description, mdn_url: url },
    };

    const context: HydrationData = {
      doc,
      blogMeta,
      pageTitle: blogMeta.title,
      locale,
      noIndexing: options.noIndexing,
      image: blogMeta.image?.file && `${BASE_URL}${url}${blogMeta.image?.file}`,
    };

    const outPath = path.join(
      BUILD_OUT_ROOT,
      locale.toLowerCase(),
      `${prefix}/${slugToFolder(blogMeta.slug)}`
    );

    await fs.mkdir(outPath, { recursive: true });

    for (const { id, html } of liveSamples) {
      const liveSamplePath = path.join(outPath, `_sample_.${id}.html`);
      await fs.writeFile(liveSamplePath, html);
      if (options.verbose) {
        console.log("Wrote", liveSamplePath);
      }
    }

    for (const asset of await fs.readdir(dirname)) {
      if (asset === "index.md") {
        continue;
      }
      const from = path.join(dirname, asset);
      const to = path.join(outPath, asset);
      await fs.copyFile(from, to);
    }

    const html = renderHTML(`/${locale}/${prefix}/${blogMeta.slug}/`, context);

    const filePath = path.join(outPath, "index.html");
    const jsonFilePath = path.join(outPath, "index.json");

    await fs.mkdir(outPath, { recursive: true });
    await fs.writeFile(filePath, html);
    await fs.writeFile(jsonFilePath, JSON.stringify(context));

    if (options.verbose) {
      console.log("Wrote", filePath);
    }
  }
}

export async function buildPost(
  document
): Promise<{ doc: Doc; liveSamples: any }> {
  const { metadata } = document;

  interface LiveSample {
    id: string;
    html: string;
  }

  const doc = { locale: DEFAULT_LOCALE } as Partial<Doc>;
  let $ = null;
  const liveSamples: LiveSample[] = [];

  [$] = await kumascript.render(document.url, {}, document);

  const liveSamplePages = kumascript.buildLiveSamplePages(
    document.url,
    document.metadata.title,
    $,
    document.rawBody
  );
  for (const liveSamplePage of liveSamplePages) {
    const { id } = liveSamplePage;
    const { html } = liveSamplePage;

    liveSamples.push({ id: id.toLowerCase(), html });
  }

  $("[data-token]").removeAttr("data-token");
  $("[data-flaw-src]").removeAttr("data-flaw-src");

  doc.title = metadata.title || "";
  doc.mdn_url = document.url;
  doc.locale = metadata.locale as string;
  doc.native = LANGUAGES_RAW[DEFAULT_LOCALE]?.native;

  if ($("math").length > 0) {
    doc.hasMathML = true;
  }
  $("div.hidden").remove();
  syntaxHighlight($, doc);
  injectNoTranslate($);
  injectLoadingLazyAttributes($);
  postProcessExternalLinks($);
  postLocalFileLinks($, doc);
  postProcessSmallerHeadingIDs($);
  wrapTables($);
  try {
    const [sections] = extractSections($);
    doc.body = sections;
  } catch (error) {
    console.error(
      `Extracting sections failed in ${doc.mdn_url} (${document.fileInfo.path})`
    );
    throw error;
  }

  doc.modified = metadata.modified || null;

  doc.pageTitle = `${doc.title} | MDN Blog`;

  doc.noIndexing = false;
  doc.toc = makeTOC(doc);

  return { doc: doc as Doc, liveSamples };
}

export async function buildBlogFeed(options: { verbose?: boolean }) {
  const prefix = "blog";
  const locale = DEFAULT_LOCALE;
  const feed = new Feed({
    title: "MDN Blog",
    description:
      "The MDN Web Docs blog publishes articles about web development, open source software, web platform updates, tutorials, changes and updates to MDN, and more.",
    id: `${BASE_URL}/${locale}/blog/`,
    link: `${BASE_URL}/${locale}/blog/`,
    language: "en",
    image: `${BASE_URL}/mdn-social-share.png`,
    favicon: `${BASE_URL}/favicon.ico`,
    copyright: "All rights reserved 2023, MDN",
  });
  const posts = await allPostFrontmatter();

  posts.forEach((post) => {
    const link = `${BASE_URL}/${DEFAULT_LOCALE}/blog/${post.slug}/`;
    const image =
      post.image?.file &&
      `${BASE_URL}/${DEFAULT_LOCALE}/blog/${post.slug}/${post.image?.file}`;
    feed.addItem({
      title: post.title,
      id: post.slug,
      link,
      description: post.description,
      author: [
        {
          name: post.author?.name || "The MDN Team",
          link: post.author?.link,
        },
      ],
      date: new Date(post.date),
      image,
    });
  });

  const outPath = path.join(BUILD_OUT_ROOT, locale.toLowerCase(), prefix);
  await fs.mkdir(outPath, { recursive: true });
  const filePath = path.join(outPath, "rss.xml");
  await fs.writeFile(filePath, feed.rss2());
  if (options.verbose) {
    console.log("Wrote", filePath);
  }
}
