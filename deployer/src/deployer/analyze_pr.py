import json
from collections import defaultdict
from pathlib import Path

from octokit import Octokit
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

    print("_____________POST___________________________________________")
    print("\n\n".join(x for x in combined_comments if x))
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
            octo = Octokit(auth="token", token=config["github_token"])
            print(repr(octo))
        else:
            print("Warning! No 'github_token' so no posting of comments")


def post_about_deployment(build_directory: Path, **config):
    template = "https://{prefix}.content.dev.mdn.mozit.cloud{mdn_url}"

    links = []
    for doc in get_built_docs(build_directory):
        url = template.format(prefix=config["prefix"], mdn_url=doc["mdn_url"])
        links.append(f"- <{url}>")

    final_comment = "## Preview deployment\n\n" + "\n".join(links)
    return final_comment


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

    per_doc_comments = []
    for doc, comment in comments:
        per_doc_comments.append(
            f"URL: `{doc['mdn_url']}`\n" f"Title: `{doc['title']}`\n" "\n" f"{comment}"
        )
    final_comment = "## External URLs\n\n" + "\n---\n".join(per_doc_comments)
    return final_comment


def post_about_flaws(build_directory: Path, **config):

    comments = []

    for doc in get_built_docs(build_directory):
        # pprint(doc["flaws"])
        if not doc.get("flaws"):
            # comments[doc].append("No flaws!")
            # comments[doc] = "No flaws!"
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

            # comments[doc] = "\n".join(flaws_list)
            comments.append((doc, "\n".join(flaws_list)))
            # comments[doc].append(f"Fla")

    def count_flaws(flaws):
        count = 0
        for flaw in flaws.values():
            count += len(flaw)
        return count

    # from pprint import pprint

    # pprint(comments)
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
    final_comment = "## Flaws\n\n" + "\n---\n".join(per_doc_comments)
    return final_comment


def get_built_docs(build_directory):
    docs = []

    def walk(directory):
        for thing in directory.iterdir():
            if thing.is_dir():
                walk(thing)
            elif thing.name == "index.json":
                with open(thing) as f:
                    data = json.load(f)
                    if "doc" not in data:
                        # Not every build index.json file is for a document.
                        return
                    doc = data["doc"]
                    docs.append(doc)

    walk(build_directory)

    return docs
