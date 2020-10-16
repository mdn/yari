const express = require("express");
const { Client } = require("@elastic/elasticsearch");

const router = express();

router.get("/", async (req, res) => {
  const URL = process.env.ELASTICSEARCH_URL || "http://localhost:9200";
  const INDEX = process.env.ELASTICSEARCH_INDEX || "yari_doc";
  const VALID_INCLUDE_VALUES = ["archived", "translated"];

  const { q, locale, include } = req.query;
  if (!q.trim()) {
    return res.status(400).json({ error: "No 'q'" });
  }

  // If it wasn't present in the querystring, default to `[en-US]`.
  // Otherwise `req.query.locale` can be an array or a string. Thanks Express!
  // Either way, make sure it's always an array with at least one valid value.
  const locales = !locale
    ? ["en-US"]
    : !Array.isArray(locale)
    ? [locale]
    : locale;
  // XXX cross check the values against our VALID_LOCALES

  // By default there's no `?include=...` but it might be an array too.
  // Validate the input and finalize it as an array.
  const includes = !include
    ? []
    : !Array.isArray(include)
    ? [include]
    : include;
  if (includes.some((value) => !VALID_INCLUDE_VALUES.includes(value))) {
    return res
      .status(400)
      .json({ error: `invalid 'include' value (${includes})` });
  }

  const params = {
    size: 10,
    page: 1,
    query: q.trim(),
    locales,
    includeArchive: includes.includes("archived"), // funky
  };

  try {
    const results = await searchDocuments(URL, INDEX, params);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

// Imagine this sitting somewhere else. Like a Lambda function. It doesn't
// understand "HTTP". Just pure JS. If something didn't work, it throws.
// It won't validate inputs, but just expects them to be correct.

async function searchDocuments(url, index, params) {
  const client = new Client({ node: url });

  console.assert(
    Array.isArray(params.locales),
    "params.locales has to be an array"
  );
  return await search(client, index, params);
}

async function search(
  client,
  index,
  params,
  { followSuggestions = true, totalOnly = false } = {}
) {
  const matchQuery = {
    multi_match: {
      fields: ["title^10", "body"],
      query: params.query,
    },
  };
  const query = {};
  if (params.locales.length || params.includeArchive) {
    const filter = [];
    if (params.locales.length) {
      filter.push({ terms: { locale: params.locales } });
    }
    if (!params.includeArchive) {
      filter.push({ term: { archived: false } });
    }
    query.bool = {
      filter,
      must: [matchQuery],
    };
  } else {
    Object.assign(query, matchQuery);
  }

  const suggest = {};
  if (followSuggestions) {
    suggest.titleSuggest = {
      text: params.query,
      term: { field: "title" },
    };
    suggest.bodySuggest = {
      text: params.query,
      term: { field: "body" },
    };
  }

  // console.log("QUERY:");
  // console.log(JSON.stringify(query, undefined, 3));

  const result = await client.search({
    index,
    body: {
      _source: { excludes: ["body"] },
      from: 0,
      highlight: {
        fields: { body: { type: "unified" }, title: {} },
        fragment_size: 120,
        number_of_fragments: 3,
        post_tags: ["</mark>"],
        pre_tags: ["<mark>"],
        encoder: "html",
      },
      query,
      suggest,
      size: params.size,
      sort: ["_score", { popularity: { order: "desc" } }],
    },
  });
  // console.log(result);

  // XXX Not great. But it works.
  console.assert(result.statusCode === 200, result.statusCode);

  if (totalOnly) {
    return result.body.hits.total;
  }

  const suggestions = [];
  if (followSuggestions) {
    suggestions.push(
      ...(await unpackSuggestions(client, index, params, result.body.suggest))
    );
  }

  const metadata = {
    took: result.body.took,
    total: result.body.hits.total,
    size: params.size,
    page: params.page,
  };
  const documents = result.body.hits.hits.map((hit) => {
    return {
      mdn_url: hit._id,
      _score: hit._score,
      title: hit._source.title,
      locale: hit._source.locale,
      slug: hit._source.slug,
      popularity: hit._source.popularity,
      highlight: {
        body: hit.highlight ? hit.highlight.body : [],
        title: hit.highlight ? hit.highlight.title : [],
      },
    };
  });
  return {
    documents,
    metadata,
    suggestions,
  };
}

async function unpackSuggestions(
  client,
  index,
  params,
  suggestionsMap,
  { minScore = 0.8 } = {}
) {
  const subQueries = [];
  for (const suggestions of Object.values(suggestionsMap)) {
    for (const suggestion of suggestions) {
      for (const option of suggestion.options) {
        if (option.score >= minScore) {
          subQueries.push(option.text);
        }
      }
    }
  }
  const deepFound = await Promise.all(
    subQueries.map(async (text) => {
      const total = await search(
        client,
        index,
        Object.assign({}, params, { query: text }),
        { followSuggestions: false, totalOnly: true }
      );
      return { text, total };
    })
  );
  return deepFound.filter((find) => find.total.value);
}

module.exports = router;
