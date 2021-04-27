import datetime
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

from github import Github
from selectolax.parser import HTMLParser

from .utils import log

comment_hidden_comment = re.compile(
    r"<!-- build_hash: ([a-f0-9]+) date: ([\d:\.\- ]+) -->"
)


def analyze_pr(build_directory: Path, config):
    """Given a directory of documents built from a PR, look through it and
    post a GitHub PR comment or just print it to stdout."""

    combined_comments = []

    if config["prefix"]:
        combined_comments.append(post_about_deployment(build_directory, **config))

    if config["analyze_flaws"]:
        combined_comments.append(post_about_flaws(build_directory, **config))

    if config["analyze_dangerous_content"]:
        combined_comments.append(
            post_about_dangerous_content(build_directory, **config)
        )

    combined_comment = "\n\n".join(x for x in combined_comments if x)

    if not combined_comment:
        print("Warning! Nothing to comment at all!")
        return

    build_hash = get_build_hash(build_directory)

    # The build_hash can potentially be used if we want to find an existing comment
    # that's already been made about this exact set of build files.
    hidden_comment = (
        f"<!-- build_hash: {build_hash} date: {datetime.datetime.utcnow()} -->"
    )
    combined_comment = f"{hidden_comment}\n\n{combined_comment}"

    if not config["repo"]:
        print("Warning! No 'repo' config")
    elif not config["pr_number"]:
        print("Warning! No 'pr_number' config")
    elif config["repo"] and config["pr_number"]:
        pr_url = f"https://github.com/{config['repo']}/pull/{config['pr_number']}"
        if config["dry_run"]:
            log.warning(f"Dry-run! Not actually posting any comment to {pr_url}")
        else:
            if not config["github_token"]:
                raise Exception("No 'github_token' so no posting of comments")

            print(f"Posting to {pr_url}")
            github = Github(config["github_token"])
            github_repo = github.get_repo(config["repo"])
            github_issue = github_repo.get_issue(number=int(config["pr_number"]))
            for comment in github_issue.get_comments():
                if comment.user.login == "github-actions[bot]":
                    if comment_hidden_comment.findall(comment.body):
                        new_body = comment_hidden_comment.sub(
                            hidden_comment, comment.body
                        )
                        new_body += f"\n\n*(this comment was updated {datetime.datetime.utcnow()})*"
                        comment.edit(body=new_body)
                        print(f"Updating existing comment ({comment})")
                        break

            else:
                github_issue.create_comment(combined_comment)

    return combined_comment


def post_about_deployment(build_directory: Path, **config):
    links = []
    for doc in get_built_docs(build_directory):
        url = mdn_url_to_dev_url(config["prefix"], doc["mdn_url"])
        links.append(f"- <{url}>")

    heading = "## Preview URLs\n\n"
    if links:
        return heading + "\n".join(links)

    return heading + "*seems not a single file was built!* 🙀"


def mdn_url_to_dev_url(prefix, mdn_url):
    template = "https://{prefix}.content.dev.mdn.mozit.cloud{mdn_url}"
    return template.format(prefix=prefix, mdn_url=mdn_url)


def post_about_dangerous_content(build_directory: Path, **config):

    OK_URL_PREFIXES = [
        "https://github.com/mdn/",
    ]

    comments = []

    for doc in get_built_docs(build_directory):
        rendered_html = "\n".join(
            x["value"]["content"]
            for x in doc["body"]
            if x["type"] == "prose" and x["value"]["content"]
        )
        tree = HTMLParser(rendered_html)
        external_urls = defaultdict(int)
        for node in tree.css("a[href]"):
            href = node.attributes.get("href")
            href = href.split("#")[0]
            # We're only interested in external URLs at the moment
            if href.startswith("//") or "://" in href:
                if any(href.lower().startswith(x.lower()) for x in OK_URL_PREFIXES):
                    # exceptions are skipped
                    continue
                external_urls[href] += 1

        if external_urls:
            external_urls_list = []
            for url in sorted(external_urls):
                count = external_urls[url]

                external_urls_list.append(
                    f"  - {'🚨 ' if url.startswith('http://') else ''}"
                    f"<{url}> ({count} time{'' if count==1 else 's'})"
                )
            comments.append((doc, "\n".join(external_urls_list)))
        else:
            comments.append((doc, "No external URLs"))

    heading = "## External URLs\n\n"
    if comments:
        per_doc_comments = []
        for doc, comment in comments:
            lines = []
            if config["prefix"]:
                url = mdn_url_to_dev_url(config["prefix"], doc["mdn_url"])
                lines.append(f"URL: [`{doc['mdn_url']}`]({url})")
            else:
                lines.append(f"URL: `{doc['mdn_url']}`")
            lines.append(f"Title: `{doc['title']}`")
            lines.append(f"[on GitHub]({doc['source']['github_url']})")
            lines.append("")
            lines.append(comment)

            per_doc_comments.append("\n".join(lines))
        return heading + "\n---\n".join(per_doc_comments)
    else:
        return heading + "*no external links in the built pages* 👱🏽"


def post_about_flaws(build_directory: Path, **config):

    comments = []

    MAX_FLAW_EXPLANATION = 5

    docs_with_zero_flaws = 0

    for doc in get_built_docs(build_directory):
        if not doc.get("flaws"):
            docs_with_zero_flaws += 1
            continue

        flaws_list = []
        for flaw_name, flaw_values in doc["flaws"].items():
            flaws_list.append(f"- **{flaw_name}**:")
            for i, flaw_value in enumerate(flaw_values):
                if i + 1 > MAX_FLAW_EXPLANATION:
                    flaws_list.append(
                        f"  - *and {len(flaw_values) - MAX_FLAW_EXPLANATION}"
                        " more flaws omitted*"
                    )
                    break
                if isinstance(flaw_value, dict):
                    explanation = flaw_value.get("explanation")
                else:
                    explanation = str(flaw_value)
                if explanation:
                    flaws_list.append(f"  - `{explanation}`")
                else:
                    flaws_list.append("  - *no explanation!*")

        comments.append((doc, "\n".join(flaws_list)))

    def count_flaws(flaws):
        count = 0
        for flaw in flaws.values():
            count += len(flaw)
        return count

    heading = "## Flaws\n\n"

    if comments:
        if docs_with_zero_flaws:
            heading += (
                f"Note! *{docs_with_zero_flaws} "
                f"document{'' if docs_with_zero_flaws == 1 else 's'} with no flaws "
                "that don't need to be listed. 🎉*\n\n"
            )

        # Now turn all of these individual comments into one big one
        per_doc_comments = []
        for doc, comment in comments:
            lines = []
            if config["prefix"]:
                url = mdn_url_to_dev_url(config["prefix"], doc["mdn_url"])
                lines.append(f"URL: [`{doc['mdn_url']}`]({url})")
            else:
                lines.append(f"URL: `{doc['mdn_url']}`")
            lines.append(f"Title: `{doc['title']}`")
            lines.append(f"[on GitHub]({doc['source']['github_url']})")
            if count_flaws(doc["flaws"]):
                lines.append(f"Flaw count: {count_flaws(doc['flaws'])}")
            lines.append("")
            lines.append(comment)

            per_doc_comments.append("\n".join(lines))
        return heading + "\n\n---\n\n".join(per_doc_comments)
    else:
        return heading + "*None!* 🎉"


def get_built_docs(build_directory: Path):
    assert build_directory.exists, f"{build_directory} does not exist"
    docs = []
    for path in build_directory.rglob("index.json"):
        with open(path) as f:
            data = json.load(f)
            if "doc" not in data:
                # Not every build index.json file is for a document.
                continue
            doc = data["doc"]
            docs.append(doc)
    return docs


def get_build_hash(build_directory: Path):
    hash_ = hashlib.md5()
    for path in build_directory.rglob("index.json"):
        with open(path, "rb") as f:
            hash_.update(f.read())
    return hash_.hexdigest()
