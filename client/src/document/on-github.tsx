import { Doc } from "../../../libs/types/document";

export function OnGitHubLink({ doc }: { doc: Doc }) {
  return (
    <div id="on-github" className="on-github">
      <h3>Found a content problem with this page?</h3>
      <ul>
        <li>
          <EditOnGitHubLink doc={doc}>Edit the page on GitHub</EditOnGitHubLink>
          .
        </li>
        <li>
          <NewIssueOnGitHubLink doc={doc}>
            Report the content issue
          </NewIssueOnGitHubLink>
          .
        </li>
        <li>
          <SourceOnGitHubLink doc={doc}>
            View the source on GitHub
          </SourceOnGitHubLink>
          .
        </li>
      </ul>
      Want to get more involved?{" "}
      <a
        href="https://github.com/mdn/content/blob/main/CONTRIBUTING.md"
        title={`This will take you to our contribution guidelines on GitHub.`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn how to contribute
      </a>
      .
    </div>
  );
}

function EditOnGitHubLink({
  doc,
  children,
}: {
  doc: Doc;
  children: React.ReactNode;
}) {
  const { github_url } = doc.source;
  return (
    <a
      href={github_url.replace("/blob/", "/edit/")}
      title={`This will take you to GitHub, where you'll need to sign in first.`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

const METADATA_TEMPLATE = `
<!-- Do not make changes below this line -->
<details>
<summary>Page report details</summary>

* Folder: \`$FOLDER\`
* MDN URL: https://developer.mozilla.org$PATHNAME
* GitHub URL: $GITHUB_URL
* Last commit: $LAST_COMMIT_URL
* Document last modified: $DATE

</details>
`;

function fillMetadata(string, doc) {
  const { folder, github_url, last_commit_url } = doc.source;
  return string
    .replace(/\$PATHNAME/g, doc.mdn_url)
    .replace(/\$FOLDER/g, folder)
    .replace(/\$GITHUB_URL/g, github_url)
    .replace(/\$LAST_COMMIT_URL/g, last_commit_url)
    .replace(
      /\$DATE/g,
      doc.modified ? new Date(doc.modified).toISOString() : "*date not known*"
    )
    .trim();
}

function NewIssueOnGitHubLink({
  doc,
  children,
}: {
  doc: Doc;
  children: React.ReactNode;
}) {
  const { locale } = doc;
  const url = new URL("https://github.com/");
  const sp = new URLSearchParams();

  url.pathname =
    locale !== "en-US"
      ? "/mdn/translated-content/issues/new"
      : "/mdn/content/issues/new";
  sp.set(
    "template",
    locale !== "en-US"
      ? `page-report-${locale.toLowerCase()}.yml`
      : "page-report.yml"
  );
  sp.set("mdn-url", `https://developer.mozilla.org${doc.mdn_url}`);
  sp.set("metadata", fillMetadata(METADATA_TEMPLATE, doc));

  url.search = sp.toString();

  return (
    <a
      href={url.href}
      title="This will take you to GitHub to file a new issue."
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function SourceOnGitHubLink({
  doc,
  children,
}: {
  doc: Doc;
  children: React.ReactNode;
}) {
  const { github_url, folder } = doc.source;
  return (
    <a
      href={`${github_url}?plain=1`}
      title={`Folder: ${folder} (Opens in a new tab)`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
