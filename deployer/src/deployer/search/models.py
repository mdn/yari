from elasticsearch_dsl import (
    Boolean,
    Document as ESDocument,
    Float,
    Keyword,
    Text,
    analyzer,
)

"""
A great way to debug analyzers is with the `Document._index.analyze()` API which
is a convenient abstraction for the Elasticsearch Analyze API
https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-analyze.html

But you can also use the Deployer CLI tool. For example:

    poetry run deployer search-analyze "l'avion" html_text_analyzer

An important thing to note is that if you change the analyzers (here in the Python
code) it won't take effect until you rebuild the index. So you might need to run

    # before
    poetry run deployer search-analyze "l'avion" html_text_analyzer
    poetry run deployer search-index ../client/build
    # after
    poetry run deployer search-analyze "l'avion" html_text_analyzer

"""

text_analyzer = analyzer(
    "text_analyzer",
    tokenizer="standard",
    # The "asciifolding" token filter makes it so that
    # typing "bézier" becomes the same as searching for "bezier"
    # https://www.elastic.co/guide/en/elasticsearch/reference/7.9/analysis-asciifolding-tokenfilter.html
    # The "elison" token filter removes elisons from the text.
    # For example "l'avion" becomes "avion".
    # https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-elision-tokenfilter.html
    filter=["word_delimiter", "elision", "lowercase", "stop", "asciifolding"],
    # char_filter=["html_strip"],
)

html_text_analyzer = analyzer(
    "html_text_analyzer",
    tokenizer="standard",
    filter=["elison", "lowercase", "asciifolding", "stop", "snowball"],
    # It's important that you don't use `char_filter=["html_strip"]`
    # on the titles. For example, there are titles like `<video>`.
    # If you do `GET /_analyze` on that with or without the html_strip
    # char filter is the difference between getting `["video"]` and `[]`.
)


class Document(ESDocument):
    title = Text(required=True, analyzer=html_text_analyzer)
    body = Text(analyzer=text_analyzer)
    summary = Text(analyzer=text_analyzer)
    locale = Keyword()
    archived = Boolean()
    slug = Keyword()
    popularity = Float()

    class Index:
        name = "mdn_docs"
