import { Doc } from "./types";

export function OnGitHubLink({ doc }: { doc: Doc }) {
  return (
    <div id="on-github" className="on-github">
      <h4>Found a problem with this page?</h4>
      <ul>
        <li>
          <SourceOnGitHubLink doc={doc} />
        </li>
        <li>
          <NewIssueOnGitHubLink doc={doc} />
        </li>
        <li>
          Want to fix the problem yourself? See{" "}
          <a
            href="https://github.com/mdn/content/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            our Contribution guide
          </a>
          .
        </li>
      </ul>
    </div>
  );
}
function SourceOnGitHubLink({ doc }: { doc: Doc }) {
  const { github_url, folder } = doc.source;
  return (
    <a
      href={github_url}
      title={`Folder: ${folder} (Opens in a new tab)`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Source on <b>GitHub</b>
    </a>
  );
}

const NEW_ISSUE_TEMPLATE = `
MDN URL: https://developer.mozilla.org$PATHNAME

#### What information was incorrect, unhelpful, or incomplete?


#### Specific section or headline?


#### What did you expect to see?


#### Did you test this? If so, how?


<!-- Do not make changes below this line -->
<details>
<summary>MDN Content page report details</summary>

* Folder: \`$FOLDER\`
* MDN URL: https://developer.mozilla.org$PATHNAME
* GitHub URL: $GITHUB_URL
* Last commit: $LAST_COMMIT_URL
* Document last modified: $DATE

</details>
  `.trim();

// These are the hardcoded prefixes that get their own new-issue label in
// in GitHub. The prefix is matched all in lower-case but the label itself
// can have case.
// The labels do not not needs to exist in advance on the GitHub repo.
// If not matched to any of these labels, it will default to "Other" as the label.
const CONTENT_LABELS_PREFIXES = [
  ["web/javascript", "JavaScript"],
  ["web/css", "CSS"],
  ["web/html", "HTML"],
  ["web/api", "WebAPI"],
  ["web/http", "HTTP"],
  ["mozilla/add-ons/webextensions", "WebExt"],
  ["web/accessibility", "A11y"],
  ["learn", "Learn"],
  ["tools", "DevTools"],
];

function NewIssueOnGitHubLink({ doc }: { doc: Doc }) {
  const baseURL = "https://github.com/mdn/content/issues/new";
  const sp = new URLSearchParams();

  const { folder, github_url, last_commit_url } = doc.source;
  const body = NEW_ISSUE_TEMPLATE.replace(/\$PATHNAME/g, doc.mdn_url)
    .replace(/\$FOLDER/g, folder)
    .replace(/\$GITHUB_URL/g, github_url)
    .replace(/\$LAST_COMMIT_URL/g, last_commit_url)
    .replace(
      /\$DATE/g,
      doc.modified ? new Date(doc.modified).toISOString() : "*date not known*"
    )
    .trim();
  sp.set("body", body);
  const maxLength = 50;
  const titleShort =
    doc.title.length > maxLength
      ? `${doc.title.slice(0, maxLength)}…`
      : doc.title;
  sp.set("title", `Issue with "${titleShort}": (short summary here please)`);

  const slug = doc.mdn_url.split("/docs/")[1].toLowerCase();
  let contentLabel = "";
  for (const [prefix, label] of CONTENT_LABELS_PREFIXES) {
    if (slug.startsWith(prefix)) {
      contentLabel = label;
      break;
    }
  }
  if (!contentLabel) {
    contentLabel = "Other";
  }
  sp.set("labels", `Content:${contentLabel},needs-triage`);

  const href = `${baseURL}?${sp.toString()}`;

  return (
    <a
      href={href}
      title="This will take you to https://github.com/mdn/content to file a new issue"
      target="_blank"
      rel="noopener noreferrer"
    >
      Report a problem with this content on <b>GitHub</b>
    </a>
  );
}
