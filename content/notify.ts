// Runs from the root of the mdn/content checkout
// Requires `gh` CLI
// Requires `jq` CLI
// Requires `yq` CLI
// Known issues: it doesn't ignore completely new slugs

const child_process = require("child_process");
const frontmatter = require("front-matter");
const fs = require("fs");

require("dotenv").config();

const { CONTENT_ROOT } = process.env;

const DATE_RANGE_REGEXP = /^(\d{4}-\d{2}-\d{2})+\.\.(\d{4}-\d{2}-\d{2}|\*)$/;

function main() {
  const merged = process.argv[2];

  if (!DATE_RANGE_REGEXP.test(merged)) {
    console.error(
      "Please specify merged date as a range: YYYY-MM-DD..YYYY-MM-DD | YYYY-MM-DD..*"
    );
    process.exit(1);
  }

  processMergedPRs(merged);
}

interface PullRequest {
  id: string;
  number: number;
  title: string;
  url: string;
  files: ChangedFile[];
}

interface ChangedFile {
  path: string;
  additions: number;
  deletions: number;
}

function processMergedPRs(merged: string) {
  const search = ["is:merged", `merged:${merged}`];

  const fields = ["id", "number", "url", "title", "files"];

  const prs = JSON.parse(
    child_process.execSync(
      `gh pr list --search '${search.join(" ")}' --json ${fields.join(",")}`,
      {
        cwd: CONTENT_ROOT,
        encoding: "utf-8",
      }
    )
  ) as PullRequest[];

  prs.forEach((pr) => processPR(pr));
}

function processPR(pr: PullRequest) {
  for (const file of pr.files) {
    let notify = false;
    if (file.path.endsWith("index.md")) {
      const net = netDiffSize(file);

      if (!(net < 5)) {
        notify = true;
      }

      if (notify === true) {
        const slug = getSlug(file.path);
        console.log(`${pr.number}\t${slug}`);
        // TODO: post to notifications API endpoint
      }
    }
  }
}

function netDiffSize(file: ChangedFile) {
  return file.additions - file.deletions;
}

function getSlug(path: string) {
  path = path.substring("files/".length);

  const markdown = fs.readFileSync(`${CONTENT_ROOT}/${path}`, "utf8");

  const frontMatter = frontmatter(markdown);

  return frontMatter.attributes.slug;
}

main();
