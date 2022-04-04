// Generates content update changes from merged PRs in mdn/content.
//
// Usage: `yarn ts-node notify.ts MERGED_DATE_OR_RANGE [OUTPUT_FILE]`
//
// Example:
// - Run: `yarn ts-node notify.ts '2022-04-01' changes.json`
// - This generates changes for all PRs merged on 2022-04-01 into changes.json.
//
// Requirements:
// - Have `gh` CLI installed and configured.
// - Have mdn/content checked out and up-to-date.
// - Have CONTENT_ROOT set in .env (pointing to files/ in the checkout).

import * as child_process from "child_process";
import frontmatter from "front-matter";
import * as fs from "fs";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const { CONTENT_ROOT } = process.env;

const DATE_RANGE_REGEXP = /^(\d{4}-\d{2}-\d{2})(\.\.(\d{4}-\d{2}-\d{2}|\*))?$/;
const FORCE_NOTIFICATION_LABEL = "force-notifications";

const EVENT_CONTENT_UPDATED = "content_updated";

function main() {
  const merged = process.argv[2];
  const output = process.argv[3];

  if (!DATE_RANGE_REGEXP.test(merged)) {
    console.error(
      "Please specify merged date in this format: YYYY-MM-DD | YYYY-MM-DD..YYYY-MM-DD | YYYY-MM-DD..*"
    );
    process.exit(1);
  }

  const search = `is:merged merged:${merged}`;

  console.log(`Searching for PRs... (${search})`);
  const prs = [...searchContentPRs(search)];
  console.log(`-> Found ${prs.length} PR(s).`);

  console.log(`Generating changes...`);
  const changes = [...generateChangesFromPRs(prs)];
  console.log(`-> Generated ${changes.length} change(s).`);

  const json = JSON.stringify(changes);

  if (output) {
    fs.writeFileSync(output, json);
  } else {
    console.log(json);
  }
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
interface PageFrontmatter {
  slug: string;
}

interface ContentUpdateChange {
  event: "content_updated";
  slug: string | null;
  pr: {
    number: number;
    title: string;
    url: string;
  };
}

function* searchContentPRs(search: string): Generator<PullRequest> {
  const fields = ["id", "number", "url", "labels", "title", "files"].join(",");

  const prs = JSON.parse(
    child_process.execSync(
      `gh pr list --head main --limit 1000 --search '${search}' --json ${fields}`,
      {
        cwd: CONTENT_ROOT,
        encoding: "utf-8",
      }
    )
  );

  yield* prs;
}

function* generateChangesFromPRs(
  prs: PullRequest[]
): Generator<ContentUpdateChange> {
  for (const pr of prs) {
    yield* generateChangesFromPR(pr);
  }
}

function* generateChangesFromPR(
  pr: PullRequest
): Generator<ContentUpdateChange> {
  // A PR labeled force-notifications must trigger a notification
  // issued for every slug modified by the PR.
  const force = pr.labels.some(({ name }) => name === FORCE_NOTIFICATION_LABEL);

  const markdownFiles = pr.files.filter((file) =>
    file.path.endsWith("index.md")
  );

  if (!force && markdownFiles.length >= 6) {
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

    const event = EVENT_CONTENT_UPDATED;
    try {
      const slug = getSlug(file.path);
      const change = {
        event,
        slug,
        pr: {
          number: pr.number,
          title: pr.title,
          url: pr.url,
        },
      };
      yield change as ContentUpdateChange;
    } catch (e) {
      console.error(e);
    }
  }
}

function netDiffSize(file: ChangedFile) {
  return file.additions - file.deletions;
}

function getSlug(path: string): string | null {
  path = resolveContentPath(path);

  if (!path) {
    console.warn(`File not found: ${path}`);
    return null;
  }

  const markdown = fs.readFileSync(path, "utf8");

  const frontMatter = frontmatter<PageFrontmatter>(markdown);

  return frontMatter.attributes.slug;
}

function resolveContentPath(file: string): string | null {
  if (file.startsWith("files/")) {
    file = file.substring("files/".length);
  }

  file = `${CONTENT_ROOT}/${file}`;

  if (fs.existsSync(file)) {
    return file;
  }

  return null;
}

main();
