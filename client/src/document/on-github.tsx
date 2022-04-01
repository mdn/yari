import { Doc } from "./types";

export function OnGitHubLink({ doc }: { doc: Doc }) {
  return (
    <div id="on-github" className="on-github">
      <h4>Found a problem with this page?</h4>
      <ul>
        <li>
          <EditOnGitHubLink doc={doc} />
        </li>
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
      href={`${github_url}?plain=1`}
      title={`Folder: ${folder} (Opens in a new tab)`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Source on <b>GitHub</b>
    </a>
  );
}

function EditOnGitHubLink({ doc }: { doc: Doc }) {
  const { github_url } = doc.source;
  return (
    <a
      href={github_url.replace("/blob/", "/edit/")}
      title={`You're going to need to sign in to GitHub first (Opens in a new tab)`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Edit on <b>GitHub</b>
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

function NewIssueOnGitHubLink({ doc }: { doc: Doc }) {
  let baseURL = "https://github.com/mdn/content/issues/new";
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

  const { locale } = doc;

  if (locale !== "en-US") {
    baseURL = "https://github.com/mdn/translated-content/issues/new";
  }

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
