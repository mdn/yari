const express = require("express");

const { DEFAULT_LOCALE, VALID_LOCALES } = require("../libs/constants");

const { Client } = require("@elastic/elasticsearch");

const router = express();

router.get("/", async (req, res) => {
  const URL = process.env.ELASTICSEARCH_URL || "http://localhost:9200";
  const INDEX = process.env.ELASTICSEARCH_INDEX || "yari_doc";

  // const { q, locale, include } = req.query;
  let params;
  try {
    params = makeParams(req.query);
  } catch (err) {
    return res.status(400).json({ error: err.toString() });
  }

  try {
    const results = await searchDocuments(URL, INDEX, params);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

function makeParams({ q, locale, include, size, page, sort }) {
  const VALID_INCLUDE_VALUES = ["archived", "translated"];
  const DEFAULT_SIZE = 10;
  const query = q.trim();
  if (!query) {
    throw new Error("No 'q'");
  }

  // If it wasn't present in the querystring, default to `[en-US]`.
  // Otherwise `req.query.locale` can be an array or a string. Thanks Express!
  // Either way, make sure it's always an array with at least one valid value.
  // Also, note that the `locale` is ALWAYS stored in lowercase so
  const locales = !locale
    ? [DEFAULT_LOCALE]
    : !Array.isArray(locale)
    ? [locale.toLowerCase()]
    : locale.map((each) => each.toLowerCase());
  if (locales.some((value) => !VALID_LOCALES.has(value))) {
    throw new Error(`invalid 'locale' value (${locales})`);
  }

  // By default there's no `?include=...` but it might be an array too.
  // Validate the input and finalize it as an array.
  const includes = !include
    ? []
    : !Array.isArray(include)
    ? [include]
    : include;
  if (includes.some((value) => !VALID_INCLUDE_VALUES.includes(value))) {
    throw new Error(`invalid 'include' value (${includes})`);
  }

  if (size) {
    // if it's supplied, check it
    try {
      size = parseInt(size);
      if (size < 1 || size > 100) {
        throw new Error("Invalid number");
      }
    } catch (err) {
      throw new Error(`invalid 'size' value (${size})`);
    }
  } else {
    size = DEFAULT_SIZE;
  }

  if (page) {
    // if it's supplied, check it
    try {
      page = parseInt(page);
      if (page < 1 || page > 10) {
        throw new Error("Invalid number");
      }
    } catch (err) {
      throw new Error(`invalid 'size' value (${size})`);
    }
  } else {
    page = 1;
  }

  if (sort) {
    // if it's supplied, check it
    if (!["popularity", "relevance", "best"].includes(sort)) {
      throw new Error(`invalid 'size' value (${size})`);
    }
  }

  return {
    size,
    page,
    query,
    locales,
    sort,
    includeArchive: includes.includes("archived"), // funky
  };
}

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
      fields: ["title^20", "body"],
      query: params.query,
    },
  };
  let query = {};
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

  const sort = [];
  if (params.sort === "relevance") {
    // Sort by 1) score and 2) popularity
    sort.push("_score");
    sort.push({ popularity: { order: "desc" } });
  } else if (params.sort === "popularity") {
    // Sort by 1) popularity and 2) score
    sort.push({ popularity: { order: "desc" } });
    sort.push("_score");
  } else {
    // Combination of popularity AND score
    // See https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html
    query = {
      function_score: {
        field_value_factor: {
          field: "popularity",
          factor: 10.0,
          missing: 0.0,
        },
        boost_mode: "sum",
        query: query,
      },
    };
  }

  // console.log("QUERY:");
  // console.log(JSON.stringify(query, undefined, 3));

  const result = await client.search({
    index,
    body: {
      _source: { excludes: ["body"] },
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
      from: params.page - 1,
      sort,
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
