const got = require("got");
const parser = require("fast-xml-parser");
const cheerio = require("cheerio");

async function getFeedEntries(url) {
  const buffer = await got(url, {
    responseType: "buffer",
    resolveBodyOnly: true,
    timeout: 5000,
    retry: 5,
  });
  const feed = parser.parse(buffer.toString());
  const entries = [];
  for (const item of feed.rss.channel.item) {
    const description = cheerio.load(item.description);
    const summary = description("p").text();
    const title = cheerio.load(item.title).text();
    entries.push({
      url: item.link,
      title,
      pubDate: new Date(item.pubDate),
      creator: item["dc:creator"],
      summary,
    });
  }
  return entries;
}

module.exports = { getFeedEntries };
