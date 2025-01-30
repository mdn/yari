import path from "node:path";
import fs from "node:fs";
import { CONTENT_ROOT } from "../libs/env/index.js";
import { DocFrontmatter } from "../libs/types/document.js";
import frontmatter from "front-matter";
import puppeteer from "puppeteer";
import { exec } from "node:child_process";
import { promisify } from "node:util";

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

  const browser = await puppeteer.launch({
    browser: "firefox",
    headless: true,
  });

  const page = await browser.newPage();

  for (const slug of slugs) {
    const o = `${oldUrl}/en-US/${slug}`;
    const n = `${newUrl}/en-US/${slug}`;

    const oldConsoleResult = await getConsoleOutputFromJSExample(
      page,
      o,
      false
    );
    const newConsoleResult = await getConsoleOutputFromJSExample(page, n, true);

    console.log(
      `\n######\n${slug}:\nold result:\n${oldConsoleResult}\nnew result:\n${newConsoleResult}`
    );
  }
}

async function getConsoleOutputFromJSExample(
  page: puppeteer.Page,
  url: string,
  queryCustomElement = false
): Promise<string> {
  await page.setViewport({
    width: 1200,
    height: 1200,
    deviceScaleFactor: 1,
    isMobile: false,
  });
  await page.goto(url);
  await new Promise((res) => setTimeout(res, 500));
  let ret = "";
  try {
    if (queryCustomElement) {
      const interactiveExample = await page.waitForSelector(
        "interactive-example"
      );
      const btn = await interactiveExample.waitForSelector(">>> #execute");
      await btn.click();
      await new Promise((res) => setTimeout(res, 800));
      const cons = await interactiveExample.waitForSelector(">>> #console");
      const consUl = await cons.waitForSelector(">>> ul");
      const output = (
        await consUl.$$eval("li", (lis) =>
          lis.map((li) => "> " + li.textContent?.trim() || "")
        )
      ).join("\n");
      // const content = await consUl.evaluate((el) => el.textContent);
      // console.log(output);
      ret = output;
      // await page.waitForSelector("interactive-example >>> #console >>> ul")
      //     .evaluate((el) => el.textContent);
    } else {
      const iframe = await (
        await page.waitForSelector("iframe.interactive")
      ).contentFrame();
      const btn = await iframe.waitForSelector("#execute", { timeout: 500 });
      await btn.click();
      const consoleElement = await iframe.waitForSelector("#console", {
        timeout: 500,
      });
      const consoleText = await consoleElement.evaluate((el) => el.textContent);
      // console.log(`url: ${url}: ${consoleText}`);
      ret = consoleText;
    }
  } catch (error) {
    console.error(error);
  }

  // if (queryCustomElement) {
  //   await new Promise((res) => setTimeout(res, 600));
  // }
  // await page.close();
  return ret;
}
