import { Doc } from "../../../libs/types/document";

export function OnGitHubLink({ doc }: { doc: Doc }) {
  return (
    <div id="on-github" className="on-github">
      <SourceOnGitHubLink doc={doc}>
        View this page on GitHub
      </SourceOnGitHubLink>{" "}
      •{" "}
      <NewIssueOnGitHubLink doc={doc}>
        Report a problem with this content
      </NewIssueOnGitHubLink>
    </div>
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
  let { folder, github_url, last_commit_url } = doc.source;

  if (doc.locale === "de") {
    github_url = github_url.replace(
      "/translated-content/",
      "/translated-content-de/"
    );
    last_commit_url = last_commit_url.replace(
      "/translated-content/",
      "/translated-content-de/"
    );
  }

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

  if (locale === "de") {
    url.pathname = "/mdn/translated-content-de/issues/new";
  }

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
  let { github_url, folder } = doc.source;

  if (doc.locale === "de") {
    github_url = github_url.replace(
      "/translated-content/",
      "/translated-content-de/"
    );
  }

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
