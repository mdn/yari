const express = require("express");
const { Client } = require("@elastic/elasticsearch");

const router = express();

router.get("/", async (req, res) => {
  const URL = process.env.ELASTICSEARCH_URL || "http://localhost:9200";
  const INDEX = process.env.ELASTICSEARCH_INDEX || "yari_doc";

  const { q, locale } = req.query;
  if (!q.trim()) {
    return res.status(400).send("No 'q'");
  }
  const params = {
    size: 10,
    page: 1,
    query: q.trim(),
    locale,
  };

  try {
    const { documents, metadata } = await searchDocuments(URL, INDEX, params);
    const results = {
      documents,
      metadata,
    };
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

async function searchDocuments(url, index, params) {
  const client = new Client({ node: url });

  const result = await client.search({
    index,
    body: {
      highlight: {
        encoder: "html",
        fields: { body: {}, title: {} },
        fragment_size: 80,
        number_of_fragments: 4,
        post_tags: ["</mark>"],
        pre_tags: ["<mark>"],
      },
      query: {
        multi_match: { fields: ["title^10", "body"], query: params.query },
      },
      size: params.size,
      // sort: [{ popularity: { order: "desc" } }, "_score"],
      // IT ONLY MAKES SENSE TO SORT BY POPULARITY FIRST IF THE SEARCH IS TOO SHORT
      sort: ["_score", { popularity: { order: "desc" } }],
    },
  });
  // console.log(result);

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
      },
    };
  });
  return {
    documents,
    metadata,
  };
}

module.exports = router;
