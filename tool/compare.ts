import path from "node:path";
import fs from "node:fs";
import { CONTENT_ROOT } from "../libs/env/index.js";
import { DocFrontmatter } from "../libs/types/document.js";
import frontmatter from "front-matter";
import puppeteer, { Page } from "puppeteer";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { retry } from "ts-retry-promise";
// import { createPool, Pool } from "lightning-pool";

const CONCURRENCY = 6;
const MAX_RETRIES = 5;
const HEADLESS = true;
const BROWSER = "chrome";

export async function compareInteractiveExamples(
  oldUrl: string,
  newUrl: string
): Promise<void> {
  console.log(`Comparing ${oldUrl} and ${newUrl}`);

  // Gather slugs to check.
  const slugs = await findSlugs();
  console.log(`Found ${slugs.length} slugs to check.`);
  fs.writeFileSync("compare-slugs.json", JSON.stringify(slugs, null, 2));

  // Collect old and new output results from all slugs.
  const results = await collectResults(oldUrl, newUrl, slugs);
  fs.writeFileSync("compare-results.json", JSON.stringify(results, null, 2));
}

// Find eligible slugs to check.
async function findSlugs(): Promise<string[]> {
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

  return slugs;
}

// This function collects the interactive javascript example console output from the
// old and the new version of the examples found at URLs generated from the passed-in
// slugs
async function collectResults(
  oldUrl: string,
  newUrl: string,
  slugs: string[],
  locale = "en-US"
) {
  const browser = await puppeteer.launch({
    browser: BROWSER,
    headless: HEADLESS,
    defaultViewport: {
      width: 1250,
      height: 1300,
      isMobile: false,
      deviceScaleFactor: 1,
    },
  });

  const results: any[] = [];

  // Process slugs in batches of size CONCURRENCY.
  for (let i = 0; i < slugs.length; i += CONCURRENCY) {
    const batch = slugs.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (slug) => {
        // Create a new browser context and page for this slug
        const context = await browser.createBrowserContext();
        const page = await context.newPage();
        const oldUrlForSlug = `${oldUrl}/${locale}/docs/${slug}`;
        const newUrlForSlug = `${newUrl}/${locale}/docs/${slug}`;
        let ret = {};

        try {
          const oldConsoleResult = await getConsoleOutputFromJSExample(
            page,
            oldUrlForSlug,
            false
          );
          const newConsoleResult = await getConsoleOutputFromJSExample(
            page,
            newUrlForSlug,
            true
          );
          ret = { slug, oldConsoleResult, newConsoleResult };
          console.log(ret);
        } catch (error) {
          console.error(
            `Error processing ${oldUrlForSlug} and ${newUrlForSlug}:`,
            error
          );
        }

        // Close the context after the test completes
        await context.close();
        return ret;
      })
    );
    results.push(...batchResults);
  }

  await browser.close();
  return results;

  // const pages: Page[] = [];
  // for (let i = 0; i < CONCURRENCY; i++) {
  //   const context = await browser.createBrowserContext();
  //   pages.push(await context.newPage());
  // }

  // const results = [];
  // let currentIndex = 0;

  // async function processNext(pageIndex: number): Promise<void> {
  //   if (currentIndex >= slugs.length) {
  //     return;
  //   }

  //   const slug = slugs[currentIndex];
  //   currentIndex++;

  //   const page = pages[pageIndex];
  //   const o = `${oldUrl}/${locale}/docs/${slug}`;
  //   const n = `${newUrl}/${locale}/docs/${slug}`;
  //   let ret = {};

  //   try {
  //     const oldConsoleResult = await getConsoleOutputFromJSExample(
  //       page,
  //       o,
  //       false
  //     );
  //     const newConsoleResult = await getConsoleOutputFromJSExample(
  //       page,
  //       n,
  //       true
  //     );
  //     ret = {
  //       slug,
  //       oldConsoleResult,
  //       newConsoleResult,
  //     };
  //     console.log(ret);
  //   } catch (error) {
  //     console.log(`error ${o} ${n} ${error}`);
  //   }
  //   results.push(ret);

  // await page.browserContext().close();
  // const ctx = await browser.createBrowserContext();
  // const npage = await ctx.newPage();

  // pages[pageIndex] = npage;

  // Once done, pick up the next URL
  // await processNext(pageIndex);
  // }

  // await Promise.all(
  //   pages.map(async (_, i) => {
  //     // temporally space out the concurrent requests a bit
  //     await new Promise((res) => setTimeout(res, 500));
  //     return processNext(i);
  //   })
  // );
  // console.log("closing browser");
  // await browser.close();
  // return results;
}

// This function is used to get the console output from the JS example
// the `queryCustomElement` parameter is used to determine if the JS example is
// inside a custom element (new version) or not.
async function getConsoleOutputFromJSExample(
  page: puppeteer.Page,
  url: string,
  queryCustomElement = false
): Promise<string> {
  let ret = "";
  await retry(async () => await page.goto(url, { timeout: 5000 }), {
    retries: MAX_RETRIES,
  });
  // wait for a bit for the page to settle
  // await new Promise((res) => setTimeout(res, 500));
  try {
    if (queryCustomElement) {
      const interactiveExample = await page.waitForSelector(
        "interactive-example"
      );
      const playController = await page.waitForSelector(">>> play-controller");
      const btn = await playController.waitForSelector("#execute");
      await btn.click();
      // wait for the console to populate
      const cons = await interactiveExample.waitForSelector(">>> #console");
      const consUl = await cons.waitForSelector(">>> ul");
      // wait for at least one li element to show up
      await consUl.waitForSelector("li");
      const output = (
        await consUl.$$eval("li", (lis) =>
          lis.map((li) => li.textContent?.trim() || "")
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
        timeout: 5000,
      });
      const consoleText = await consoleElement.evaluate((el) => el.textContent);
      ret = consoleText.trim();
    }
  } catch (error) {
    console.log(`error when processing ${url}: ${error}`);
    return `--- ERROR --- ${error}`;
  }
  return ret;
}

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
