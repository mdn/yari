import json
import re
import time
from pathlib import Path
from collections import Counter

import click
from elasticsearch.helpers import parallel_bulk
from elasticsearch_dsl import Index
from elasticsearch_dsl.connections import connections
from selectolax.parser import HTMLParser

from .models import Document, INDEX_ALIAS_NAME


class IndexAliasError(Exception):
    """When there's something wrong with finding the index alias."""


def index(
    buildroot: Path,
    url: str,
    update=False,
    no_progressbar=False,
):
    # We can confidently use a single host here because we're not searching
    # a cluster.
    connections.create_connection(hosts=[url], retry_on_timeout=True)
    connection = connections.get_connection()
    health = connection.cluster.health()
    status = health["status"]
    if status not in ("green", "yellow"):
        raise click.ClickException(f"status {status} not green or yellow")

    count_todo = 0
    for file in walk(buildroot):
        count_todo += 1

    click.echo(f"Found {count_todo:,} (potential) documents to index")

    if update:
        for name in connection.indices.get_alias():
            if name.startswith(f"{INDEX_ALIAS_NAME}_"):
                document_index = Index(name)
                break
        else:
            raise IndexAliasError(
                f"Unable to find an index called {INDEX_ALIAS_NAME}_*"
            )

    else:
        # Confusingly, `._index` is actually not a private API.
        # It's the documented way you're supposed to reach it.
        document_index = Document._index
        click.echo(
            "Deleting any possible existing index "
            f"and creating a new one called {document_index._name!r}"
        )
        document_index.delete(ignore=404)
        document_index.create()

    skipped = []

    def generator():
        root = Path(buildroot)
        for doc in walk(root):
            # The reason for specifying the exact index name is that we might
            # be doing an update and if you don't specify it, elasticsearch_dsl
            # will fall back to using whatever Document._meta.Index automatically
            # becomes in this moment.
            search_doc = to_search(doc, _index=document_index._name)
            if search_doc:
                yield search_doc.to_dict(True)
            else:
                # The reason something might be chosen to be skipped is because
                # there's logic that kicks in only when the `index.json` file
                # has been opened and parsed.
                # Keep a count of all of these. It's used to make sure the
                # progressbar, if used, ticks as many times as the estimate
                # count was.
                skipped.append(1)

    def get_progressbar():
        if no_progressbar:
            return VoidProgressBar()
        return click.progressbar(length=count_todo, label="Indexing", width=0)

    count_done = count_worked = count_errors = 0
    count_shards_worked = count_shards_failed = 0
    errors_counter = Counter()
    t0 = time.time()
    with get_progressbar() as bar:
        for success, info in parallel_bulk(
            connection,
            generator(),
            # If the bulk indexing failed, it will by default raise a BulkIndexError.
            # Setting this to 'False' will suppress that.
            raise_on_exception=False,
            # If the bulk operation failed for some other reason like a ReadTimeoutError
            # it will raise whatever the error but default.
            # We prefer to swallow all errors under the assumption that the holes
            # will hopefully be fixed in the next attempt.
            raise_on_error=False,
        ):
            if success:
                count_shards_worked += info["index"]["_shards"]["successful"]
                count_shards_failed += info["index"]["_shards"]["failed"]
                count_worked += 1
            else:
                count_errors += 1
                errors_counter[info["index"]["error"]] += 1
            count_done += 1
            bar.update(1)

        for skip in skipped:
            bar.update(1)

    # Now when the index has been filled, we need to make sure we
    # correct any previous indexes.
    if update:
        # When you do an update, Elasticsearch will internally delete the
        # previous docs (based on the _id primary key we set).
        # Normally, Elasticsearch will do this when you restart the cluster
        # but that's not something we usually do.
        # See https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-forcemerge.html
        document_index.forcemerge()
    else:
        # Now we're going to bundle the change to set the alias to point
        # to the new index and delete all old indexes.
        # The reason for doing this together in one update is to make it atomic.
        alias_updates = [
            {"add": {"index": document_index._name, "alias": INDEX_ALIAS_NAME}}
        ]
        for index_name in connection.indices.get_alias():
            if index_name.startswith(f"{INDEX_ALIAS_NAME}_"):
                if index_name != document_index._name:
                    alias_updates.append({"remove_index": {"index": index_name}})
                    click.echo(f"Delete old index {index_name!r}")

        connection.indices.update_aliases({"actions": alias_updates})
        click.echo(
            f"Reassign the {INDEX_ALIAS_NAME!r} alias from old index "
            f"to {document_index._name}"
        )

    t1 = time.time()
    took = t1 - t0
    rate = count_done / took
    click.echo(
        f"Took {format_time(took)} to index {count_done:,} documents. "
        f"Approximately {rate:.1f} docs/second"
    )
    click.echo(
        f"Count shards - successful: {count_shards_worked:,} "
        f"failed: {count_shards_failed:,}"
    )
    click.echo(f"Counts - worked: {count_worked:,} errors: {count_errors:,}")
    if errors_counter:
        click.echo("Most common errors....")
        for error, count in errors_counter.most_common():
            click.echo(f"{count:,}\t{error[:80]}")


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
            yield from walk(path)
        elif path.name == "index.json":
            yield path


def to_search(file, _index=None):
    with open(file) as f:
        data = json.load(f)
    if "doc" not in data:
        # If the file we just opened isn't use for documents, it might be for
        # other SPAs like the home page. Skip these.
        return
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
    if doc.get("noIndexing"):
        # These are documents that we build but "don't want to be found". For
        # example, they don't get included in the sitemaps or the search-index.json
        # files.
        return
    locale = locale[1:]
    return Document(
        _index=_index,
        _id=doc["mdn_url"],
        title=doc["title"],
        # This is confusing. But it's worth hacking around for now until
        # localizations are uplifted (and unfrozen maybe).
        # A document that is definitely archived E.g. /en-us/docs/Thunderbird/XUL
        # will look like this:
        #
        #       "isArchive": true,
        #       "isTranslated": false,
        #       "locale": "en-US",
        #
        # A document that is a translation and is definitely archived
        # E.g. /fr/docs/Mozilla/Gecko/Gecko_Embedding_Basics
        # will look like this:
        #
        #       "isArchive": true,
        #       "isTranslated": false,
        #       "locale": "fr",
        #
        # Now, the really confusing one is translated documents that are
        # not archived. E.g. /fr/docs/CSS/Premiers_pas/Fonctionnement_de_CSS
        # will look like this:
        #
        #       "isArchive": true,
        #       "isTranslated": true,
        #       "locale": "fr",
        #
        # Which actually makes sense because in Yari, here "isArchive" is (ab)used
        # to do things like deciding not to show the Toolbar.
        # And for the record, here's what a perfectly maintained en-US document looks
        # like. E.g. /en-US/docs/Web/CSS
        #
        #       "isArchive": true,
        #       "isTranslated": false,
        #       "locale": "en-US",
        #
        # When searching though, we don't necessary want to think of all (for example)
        # French documents to be archived. Hence the following logic.
        archived=(doc.get("isArchive") and not doc.get("isTranslated")) or False,
        body=html_strip(
            "\n".join(
                x["value"]["content"]
                for x in doc["body"]
                if x["type"] == "prose" and x["value"]["content"]
            )
        ),
        popularity=doc["popularity"],
        summary=doc["summary"],
        # Note! We're always lowercasing the 'slug'. This way we can search on it,
        # still as a `keyword` index, but filtering by prefix.
        # E.g. in kuma; ?slug_prefix=weB/Css
        # But this means that a little bit of information is lost. However, when
        # Yari displays search results, it doesn't use this `slug` value to
        # make the URLs in the search results listings. It's using the `mdn_url`
        # for that.
        # But all of this means; remember to lowercase your `slug` before using
        # it as a filter.
        slug=slug.lower(),
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
    for tag in tree.css("div.warning, div.hidden, p.hidden"):
        tag.decompose()
    for tag in tree.css("div[style]"):
        style_value = tag.attributes["style"]
        if style_value and _display_none_regex.search(style_value):
            tag.decompose()
    text = tree.body.text()
    return "\n".join(x.strip() for x in text.splitlines() if x.strip())


def analyze(
    url: str,
    text: str,
    analyzer: str,
):
    # We can confidently use a single host here because we're not searching a cluster.
    connections.create_connection(hosts=[url])
    index = Index(INDEX_ALIAS_NAME)
    analysis = index.analyze(body={"text": text, "analyzer": analyzer})
    print(f"For text: {text!r}")
    if "tokens" in analysis:
        keys = None
        for token in analysis["tokens"]:
            if keys is None:
                keys = token.keys()
            longest_key = max(len(x) for x in keys)
            for key in keys:
                print(f"{key:{longest_key + 1}} {token[key]!r}")
            print()
    elif not analysis:
        print("No tokens found!")
    else:
        # Desperate if it's not a list of tokens
        print(json.dumps(analysis, indent=2))
