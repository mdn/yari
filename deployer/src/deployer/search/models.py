import datetime

from elasticsearch_dsl import (
    Document as ESDocument,
    Float,
    Keyword,
    Text,
    analyzer,
    token_filter,
    char_filter,
)

# Note, this is the name that the Kuma code will use when sending Elasticsearch
# search queries.
# We always build an index that is called something based on this name but with
# the _YYYYMMDDHHMMSS date suffix.
INDEX_ALIAS_NAME = "mdn_docs"

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

# This creates a token filter which is a "ruleset" that determines how any
# token should be expanded. For example, "front-end" becomes "front" and "end".
# There are many options to pick and each one needs to be carefully considered.
# To get a complete list of all the options, see the documentation at:
# https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-word-delimiter-tokenfilter.html
yari_word_delimiter = token_filter(
    "yari_word_delimiter",
    type="word_delimiter",
    # When it splits on 'Array.prototype.forEach' it first of all becomes
    # 'array', 'protoype', and 'foreach'. But also, still includes
    # as a word 'array.prototype.foreach'.
    # With this configuration we'll get good matches for both
    # 'array foreach' and if people type the full 'array.prototype.foreach'.
    preserve_original=True,
    # 'forEach' becomes 'for', 'each', and 'forEach'.
    # And searchin for 'typed array' can find 'TypedArray'
    split_on_case_change=True,
    # Otherwise things like '3D' would be a search for '3' || 'D'.
    split_on_numerics=False,
)


custom_stopwords = token_filter(
    "custom_stopwords",
    type="stop",
    ignore_case=True,
    # See https://www.peterbe.com/plog/english-stop-words-javascript-reserved-keywords
    # It's basically all the regular English stop words minus the JavaScript
    # reserved keywords (because JavaScript).
    # But, we're also making some special exception for words that are important
    # in JavaScript but aren't reserved keywords.
    # These exceptions are...
    #
    #   "at"
    #   https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
    #   http://localhost:3000/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/at
    #   http://localhost:3000/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
    #
    #   "is"
    #   https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/is
    #   http://localhost:3000/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
    #
    #   "of"
    #   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
    #   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
    #   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/of
    #
    #   "to"
    #   https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/To
    #   https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/to
    #
    # If we discover that there are other words that are too important to our
    # context, we can simply pluck them out of the list below.
    stopwords=[
        "a",
        "an",
        "and",
        "are",
        "as",
        "be",
        "but",
        "by",
        "into",
        "it",
        "no",
        "not",
        "on",
        "or",
        "such",
        "that",
        "the",
        "their",
        "then",
        "there",
        "these",
        "they",
        "was",
        "will",
    ],
)


keep_html_char_filter = char_filter(
    "keep_html_char_filter",
    type="pattern_replace",
    pattern="<([a-z]+)>",
    # The magic here is that turning things like `<video>` to `_video_`
    # and `<a>` to `_a_` means that it gets analyzed as its own token like that.
    # This way you can search for `<a>` and find `<a>: The Anchor element`.
    # But note that a search for `<section>` will *also* match
    # `<nav>: The Navigation Section element` because `<section>` is turned in the
    # the following two tokens: `['_section_', 'section']`.
    # Not great.
    # However, what if the user wants to find the page about the `<section>` HTML
    # tag and they search for `section`. Then it's a good thing that that token
    # expands to both forms.
    # A more extreme variant would be something that doesn't get token delimited.
    # For example:
    #
    #   `replacement="html$1html"`
    #
    # This would turn `<a>` to `htmlahtml` which means a search for `<a>` will
    # work expected but a search for `video` wouldn't match
    # the `<video>: The Video Embed element` page.
    replacement="_$1_",
)

special_charater_name_char_filter = char_filter(
    "special_charater_name_char_filter",
    type="pattern_replace",
    # In Java, this matches things like `yield*`, `Function*` and `data-*`.
    # But not that it will also match things like: `x*y` or `*emphasis*` which
    # is a "risk" worth accepting because event `*emphasis*` would get converted
    # to `emphasisstar` which is more accurate than letting the standard tokenizer
    # turn it into `emphasis` alone.
    pattern="(\\w+)-?\\*",
    # Now a search for `yield*` becomes a search for `yieldstar` which won't
    # get confused for `yield`.
    # We *could* consider changing the replacement for `$1__starcharacter` which means
    # it would tokenize `yield*` into `[yieldstarcharacter, yield, starcharacter]`
    # which might capture people who didn't expect to find the page about `yield`
    # when they searched for `yield*`.
    replacement="$1star",
)

unicorns_char_filter = char_filter(
    "unicorns_char_filter",
    type="mapping",
    mappings=[
        # e.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        # Also see https://github.com/mdn/yari/issues/3074
        "?. => Optionalchaining",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment
        "??= => Logicalnullishassignment",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
        "?? => Nullishcoalescingoperator",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND_assignment
        "&&= => LogicalANDassignment",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment
        "||= => LogicalORassignment",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation_assignment
        "**= => Exponentiationassignment",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Multiplication_assignment
        "*= => Multiplicationassignment",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/CSS/--*
        "--* => CustompropertiesCSSVariables",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation
        "** => 'Exponentiation",
        # E.g. http://localhost:3000/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality
        "=== => Strictequality",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality
        "!== => Strictinequality",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality
        "== => Equality",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Inequality
        "!= => Inequality",
        # E.g. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment
        "= => Assignment",
    ],
)

text_analyzer = analyzer(
    "text_analyzer",
    tokenizer="standard",
    # The "asciifolding" token filter makes it so that
    # typing "bézier" becomes the same as searching for "bezier"
    # https://www.elastic.co/guide/en/elasticsearch/reference/7.9/analysis-asciifolding-tokenfilter.html
    filter=[
        yari_word_delimiter,
        # The "elison" token filter removes elisons from the text.
        # For example "l'avion" becomes "avion".
        # https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-elision-tokenfilter.html
        "elision",
        "lowercase",
        custom_stopwords,
        # This makes it so you can search for either 'bézier' or 'bezier',
        # and end up matching to 'Bézier curve'.
        "asciifolding",
    ],
    # Note that we don't use the `html_strip` char_filter.
    # With that, we'd lose some of the valueable characters like: `<video>` which
    # is an actual title.
    char_filter=[
        unicorns_char_filter,
        special_charater_name_char_filter,
        keep_html_char_filter,
    ],
)


class Document(ESDocument):
    title = Text(required=True, analyzer=text_analyzer)
    body = Text(
        analyzer=text_analyzer,
        # Field-length norm
        # If a word is "rare" amongst all the other words in the document, it's
        # assumed that that document is more exclusively about that word.
        # For example, the Glossary page about HTTP2 might mention "HTTP2"
        # 5 times out of 100 words. But a page that's also mentioning it 5 times,
        # and that other page has 1,000 means it's more "relevant" on that
        # Glossary page.
        # However, many times the field-length norm is skewing real results.
        # For example, important and popular MDN pages are often longer because
        # they have more examples and more notes and more everything. That
        # shouldn't count against the page.
        # One example we found was "Array" appear less frequently in
        # "TypedArray.prototype.forEach()" than it did in "Array.prototype.forEach()"
        # but that's because the former has 493 words and the latter had 1,514 words.
        # Just because a page has more text doesn't mean it's less about the
        # keyword to a certain extent.
        # https://www.elastic.co/guide/en/elasticsearch/guide/current/scoring-theory.html#field-norm
        norms=False,
    )
    summary = Text(analyzer=text_analyzer)
    locale = Keyword()
    slug = Keyword()
    popularity = Float()

    class Index:
        name = (
            f'{INDEX_ALIAS_NAME}_{datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
        )
