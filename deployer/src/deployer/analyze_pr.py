import json
from collections import defaultdict
from pathlib import Path

from github import Github
from selectolax.parser import HTMLParser


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

    print("_____________POST___________________________________________")
    print(combined_comment)
    print("___________________________________________________________")

    if not config["repo"]:
        print("Warning! No 'repo' config")
    elif not config["pr_number"]:
        print("Warning! No 'pr_number' config")
    elif config["repo"] and config["pr_number"]:
        print(
            f"Posting to https://github.com/{config['repo']}/pull/{config['pr_number']}"
        )

        if config["github_token"]:
            github = Github(config["github_token"])
            github_repo = github.get_repo(config["repo"])
            github_issue = github_repo.get_issue(number=int(config["pr_number"]))
            github_issue.create_comment(combined_comment)

        else:
            print("Warning! No 'github_token' so no posting of comments")


def post_about_deployment(build_directory: Path, **config):
    template = "https://{prefix}.content.dev.mdn.mozit.cloud{mdn_url}"

    links = []
    for doc in get_built_docs(build_directory):
        url = template.format(prefix=config["prefix"], mdn_url=doc["mdn_url"])
        links.append(f"- <{url}>")

    heading = "## Preview deployment\n\n"
    if links:
        return heading + "\n".join(links)

    return heading + "*seems not a single file was built!* 🙀"


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
            print(external_urls)
            for url in sorted(external_urls):
                count = external_urls[url]

                external_urls_list.append(
                    f"  - <{url}> ({count} time{'' if count==1 else 's'})"
                )
            comments.append((doc, "\n".join(external_urls_list)))
        else:
            comments.append((doc, "No external URLs"))

    heading = "## External URLs\n\n"
    if comments:
        per_doc_comments = []
        for doc, comment in comments:
            per_doc_comments.append(
                f"URL: `{doc['mdn_url']}`\n"
                f"Title: `{doc['title']}`\n"
                "\n"
                f"{comment}"
            )
        return heading + "\n---\n".join(per_doc_comments)
    else:
        return heading + "*no external links in the built pages* 👱🏽"


def post_about_flaws(build_directory: Path, **config):

    comments = []

    for doc in get_built_docs(build_directory):
        if not doc.get("flaws"):
            comments.append((doc, "No flaws!"))
            continue
        else:
            flaws_list = []
            for flaw_name, flaw_values in doc["flaws"].items():
                flaws_list.append(f"- **{flaw_name}**:")
                for flaw_value in flaw_values:
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
        # Now turn all of these individual comments into one big one
        per_doc_comments = []
        for doc, comment in comments:
            per_doc_comments.append(
                f"URL: `{doc['mdn_url']}`\n"
                f"Title: `{doc['title']}`\n"
                f"Flaw count: {count_flaws(doc['flaws'])}\n"
                "\n"
                f"{comment}"
            )
        return heading + "\n---\n".join(per_doc_comments)
    else:
        return heading + "*none!* 🎉"


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
    # print("DOCS", len(docs))

    # dirs = []
    # files = []

    # docs2 = []

    # def walk(directory):
    #     print("WALKDEBUG, directory:", directory)
    #     for thing in directory.iterdir():
    #         print("    WALKDEBUG, thing:", thing)
    #         if not thing.is_dir():  # XXX
    #             files.append(thing)  # XXX
    #         if thing.is_dir():
    #             dirs.append(thing)
    #             walk(thing)
    #         elif thing.name == "index.json":
    #             with open(thing) as f:
    #                 data = json.load(f)
    #                 # Not every build index.json file is for a document.
    #                 if "doc" in data:
    #                     doc = data["doc"]
    #                     docs2.append(doc)

    # walk(build_directory)
    # print(f"WALKED... {len(dirs)} directories and {len(files)} files", len(docs2))

    # return docs
