from elasticsearch_dsl import (
    Boolean,
    Document as ESDocument,
    Float,
    Keyword,
    Text,
    analyzer,
)

text_analyzer = analyzer(
    "text_analyzer",
    tokenizer="standard",
    # The "asciifolding" token filter makes it so that
    # typing "bézier" becomes the same as searching for "bezier"
    # https://www.elastic.co/guide/en/elasticsearch/reference/7.9/analysis-asciifolding-tokenfilter.html
    filter=["lowercase", "stop", "asciifolding"],
    # char_filter=["html_strip"],
)

html_text_analyzer = analyzer(
    "html_text_analyzer",
    tokenizer="standard",
    filter=["lowercase", "asciifolding", "stop", "snowball"],
    # It's important that you don't use `char_filter=["html_strip"]`
    # on the titles. For example, there are titles like `<video>`.
    # If you do `GET /_analyze` on that with or without the html_strip
    # char filter is the difference between getting `["video"]` and `[]`.
)


class Document(ESDocument):
    title = Text(required=True, analyzer=html_text_analyzer)
    body = Text(analyzer=text_analyzer)
    locale = Keyword()
    archived = Boolean()
    slug = Keyword()
    popularity = Float()

    class Index:
        name = "mdn_docs"
