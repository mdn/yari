import json
import re
import time
from pathlib import Path
from collections import defaultdict

import click
from elasticsearch.helpers import streaming_bulk
from elasticsearch_dsl.connections import connections
from selectolax.parser import HTMLParser

from .models import Document


def index(
    buildroot: Path,
    url: str,
    update=False,
    no_progressbar=False,
    priority_prefixes: (str) = (),
):
    # We can confidently use a single host here because we're not searching
    # a cluster.
    connections.create_connection(hosts=[url])
    connection = connections.get_connection()
    health = connection.cluster.health()
    status = health["status"]
    if status not in ("green", "yellow"):
        raise click.ClickException(f"status {status} not green or yellow")

    count_todo = 0
    for file in walk(buildroot):
        count_todo += 1

    click.echo(f"Found {count_todo:,} (potential) documents to index")

    # Confusingly, `._index` is actually not a private API.
    # It's the documented way you're supposed to reach it.
    index = Document._index
    if not update:
        click.echo(
            "Deleting any possible existing index "
            f"and creating a new one called {index._name}"
        )
        index.delete(ignore=404)
        index.create()

    search_prefixes = [None]
    for prefix in priority_prefixes[::-1]:
        search_prefixes.insert(0, prefix)

    count_by_prefix = defaultdict(int)

    already = set()

    def generator():
        for prefix in search_prefixes:
            root = Path(buildroot)
            if prefix:
                root /= prefix
            for doc in walk(root):
                if doc in already:
                    continue
                already.add(doc)
                search_doc = to_search(doc)
                if search_doc:
                    count_by_prefix[prefix] += 1
                    yield search_doc.to_dict(True)

    def get_progressbar():
        if no_progressbar:
            return VoidProgressBar()
        return click.progressbar(length=count_todo, label="Indexing", width=0)

    count_done = 0
    t0 = time.time()
    with get_progressbar() as bar:
        for x in streaming_bulk(connection, generator(), index=index._name):
            count_done += 1
            bar.update(1)
    t1 = time.time()
    took = t1 - t0
    rate = count_done / took
    click.echo(
        f"Took {format_time(took)} to index {count_done:,} documents. "
        f"Approximately {rate:.1f} docs/second"
    )
    if priority_prefixes:
        click.echo("Counts per priority prefixes:")
        rest = sum(v for v in count_by_prefix.values())
        for prefix in priority_prefixes:
            click.echo(f"\t{prefix:<30} {count_by_prefix[prefix]:,}")
            rest -= count_by_prefix[prefix]
        prefix = "*rest*"
        click.echo(f"\t{prefix:<30} {rest:,}")


class VoidProgressBar:
    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def update(self, whatever):
        pass


def format_time(seconds):
    seconds = int(seconds)
    parts = []
    hours = seconds // 3600
    if hours:
        parts.append(f"{hours}h")
    seconds -= hours * 60 * 60
    minutes = seconds // 60
    if minutes:
        parts.append(f"{minutes}m")
    seconds -= minutes * 60
    if seconds:
        parts.append(f"{seconds}s")
    return " ".join(parts)


def walk(root):
    for path in root.iterdir():
        if path.is_dir():
            for file in walk(path):
                yield file
        elif path.name == "index.json":
            yield path


def to_search(file):
    with open(file) as f:
        data = json.load(f)
    doc = data["doc"]
    locale, slug = doc["mdn_url"].split("/docs/", 1)
    if slug.endswith("/Index"):
        # We have a lot of pages that uses the `{{Index(...)}}` kumascript macro
        # which can produce enormous pages whose content is rather useless
        # because it's only an index and thus should appear, individually,
        # elsewhere. Just skip these.
        # E.g. https://developer.allizom.org/en-US/docs/Web/API/Index
        # See also https://github.com/mdn/yari/issues/1786
        return
    locale = locale[1:]
    return Document(
        _id=doc["mdn_url"],
        title=doc["title"],
        archived=doc.get("isArchive") or False,
        body=html_strip(
            "\n".join(
                x["value"]["content"]
                for x in doc["body"]
                if x["type"] == "prose" and x["value"]["content"]
            )
        ),
        popularity=doc["popularity"],
        slug=slug,
        locale=locale.lower(),
    )


_display_none_regex = re.compile(r"display:\s*none")


def html_strip(html):
    """Return the plain text of a blob of MDN HTML.

    But before giving back the plain text, strip out certain tags because
    they are not something you see anyway when view the page.
    The kind of plain text we want is what you'd get, as a browser user,
    if you use the mouse to select the text and copy and paste it into notepadself.

    See https://www.peterbe.com/plog/selectolax-or-pyquery for why selectolax
    is a powerful and performant tool for this.
    """
    html = html.strip()
    if not html:
        return ""
    tree = HTMLParser(html)
    for tag in tree.css("div.warning, div.hidden"):
        tag.decompose()
    for tag in tree.css("div[style]"):
        style_value = tag.attributes["style"]
        if style_value and _display_none_regex.search(style_value):
            tag.decompose()
    text = tree.body.text()
    return "\n".join(x.strip() for x in text.splitlines() if x.strip())
