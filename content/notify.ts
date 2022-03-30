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
const FORCE_NOTIFICATION_LABEL = "force-notifications";

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
  labels: Label[];
}

interface Label {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface ChangedFile {
  path: string;
  additions: number;
  deletions: number;
}

function processMergedPRs(merged: string) {
  const search = ["is:merged", `merged:${merged}`];

  const fields = ["id", "number", "url", "labels", "title", "files"];

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
  // A PR labeled force-notifications must trigger a notification
  // issued for every slug modified by the PR.
  const force = pr.labels.some(({ name }) => name === FORCE_NOTIFICATION_LABEL);

  const markdownFiles = pr.files.filter((file) =>
    file.path.endsWith("index.md")
  );

  if (!force && markdownFiles.length > 5) {
    // If a merged PR modifies six or more Markdown files,
    // then no notifications should be issued for that PR
    // (to avoid issuing notifications for bulk edits).
    return;
  }

  for (const file of markdownFiles) {
    if (!force && netDiffSize(file) < 5) {
      // If the net diff size for a Markdown file is less than 5,
      // then no notifications should be issued for the affected
      // slug (to avoid issuing notifications for minor edits).
      continue;
    }

    const slug = getSlug(file.path);
    console.log(`${pr.number}\t${slug}`);
    // TODO: post to notifications API endpoint
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
