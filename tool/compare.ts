import path from "node:path";
import fs from "node:fs";
import { CONTENT_ROOT } from "../libs/env/index.js";
import { DocFrontmatter } from "../libs/types/document.js";
import frontmatter from "front-matter";
import puppeteer from "puppeteer";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import pLimit from "p-limit";

const concurrency = 8;
const limit = pLimit(concurrency);

const execAsync = promisify(exec);
async function grepSystem(searchTerm: string, directory: string) {
  try {
    const { stdout } = await execAsync(
      `grep -irl "${searchTerm}" "${directory}"`
    );
    return stdout;
  } catch (error) {
    throw new Error(`Error executing grep: ${error}`);
  }
}

export async function compareInteractiveExamples(
  oldUrl: string,
  newUrl: string
): Promise<void> {
  console.log(`Comparing ${oldUrl} and ${newUrl}`);

  const filesLookingInteresting = (
    await grepSystem(
      "EmbedInteractiveExample",
      path.join(CONTENT_ROOT, "en-us", "web", "javascript")
    )
  ).split("\n");

  const slugs = await Promise.all(
    filesLookingInteresting
      .filter((path: string) => !!path)
      .map(async (path: string) => {
        const markdown = await fs.promises.readFile(path, "utf-8");
        const frontMatter = frontmatter<DocFrontmatter>(markdown);
        return frontMatter.attributes.slug;
      })
  );

  console.log(`${slugs.length} files to check.`);

  const browser = await puppeteer.launch({
    browser: "firefox",
    headless: false,
  });

  const availablePages = await Promise.all(
    new Array(concurrency).fill(null).map(async () => {
      const page = await browser.newPage();
      await page.setViewport({
        width: 1200,
        height: 1200,
        deviceScaleFactor: 1,
        isMobile: false,
      });
      return page;
    })
  );

  async function withPage<T>(
    fn: (p: puppeteer.Page) => Promise<T>
  ): Promise<T> {
    while (!availablePages.length) {
      await new Promise((r) => setTimeout(r, 50));
    }
    const page = availablePages.pop();
    try {
      return await fn(page);
    } finally {
      availablePages.push(page);
    }
  }

  const results = await Promise.all(
    slugs.map((slug) =>
      limit(() =>
        withPage(async (page) => {
          const o = `${oldUrl}/en-US/${slug}`;
          const n = `${newUrl}/en-US/${slug}`;

          const oldConsoleResult = await getConsoleOutputFromJSExample(
            page,
            o,
            false
          );
          const newConsoleResult = await getConsoleOutputFromJSExample(
            page,
            n,
            true
          );
          const ret = {
            slug,
            oldConsoleResult,
            newConsoleResult,
            different: oldConsoleResult !== newConsoleResult,
          };
          console.log(ret);
          return ret;
        })
      )
    )
  );

  console.log(results);
  fs.writeFileSync("compare-results.json", JSON.stringify(results, null, 2));

  // good bye browser
  await browser.close();
}

async function getConsoleOutputFromJSExample(
  page: puppeteer.Page,
  url: string,
  queryCustomElement = false
): Promise<string> {
  let ret = "";
  try {
    await page.goto(url);
    // wait for a bit for the page to settle
    await new Promise((res) => setTimeout(res, 500));
    if (queryCustomElement) {
      const interactiveExample = await page.waitForSelector(
        "interactive-example"
      );
      const btn = await interactiveExample.waitForSelector(">>> #execute");
      await btn.click();
      // wait for the console to populate
      await new Promise((res) => setTimeout(res, 800));
      const cons = await interactiveExample.waitForSelector(">>> #console");
      const consUl = await cons.waitForSelector(">>> ul");
      const output = (
        await consUl.$$eval("li", (lis) =>
          lis.map((li) => "> " + li.textContent?.trim() || "")
        )
      ).join("\n");
      ret = output;
    } else {
      const iframe = await (
        await page.waitForSelector("iframe.interactive")
      ).contentFrame();
      const btn = await iframe.waitForSelector("#execute", { timeout: 10000 });
      await btn.click();
      const consoleElement = await iframe.waitForSelector("#console", {
        timeout: 500,
      });
      const consoleText = await consoleElement.evaluate((el) => el.textContent);
      ret = consoleText.trim();
    }
  } catch (error) {
    console.log(`error when processing ${url}: ${error}`);
    return "--- ERROR ---";
  }
  return ret;
}
