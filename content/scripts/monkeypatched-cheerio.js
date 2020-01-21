/**
 * Why this file?
 * As of Jan 2020, cheerio 1.0.0-rc3 has an annoying bug/feature. When
 * it serializes HTML, every non-ascii character is encoded. E.g. `é`
 * becomes `&#xE9;`. You *could* disable that with
 * `$.html({ decodeEntities: false})` but that would also allow other things,
 * which should be encoded, left alone. E.g. `Communauté &amp; Support`
 * becomes `Communauté & Support` and `<p>&lt;code&gt;</p>` becomes
 * `<p><code></p>` which is superwrong.
 *
 * See https://github.com/cheeriojs/cheerio/issues/866 for the issue.
 * https://github.com/cheeriojs/cheerio/issues/866#issuecomment-482730997
 * for the solution which this is made from.
 */

const cheerio = require("cheerio");
const load = cheerio.load;

function decode(string) {
  return string.replace(/&#x([0-9a-f]{1,6});/gi, (entity, code) => {
    code = parseInt(code, 16);

    // Don't unescape ASCII characters, assuming they're encoded for a good reason
    if (code < 0x80) return entity;

    return String.fromCodePoint(code);
  });
}

function wrapHtml(fn) {
  return function() {
    const result = fn.apply(this, arguments);
    return typeof result === "string" ? decode(result) : result;
  };
}

cheerio.load = function() {
  const instance = load.apply(this, arguments);

  instance.html = wrapHtml(instance.html);
  instance.prototype.html = wrapHtml(instance.prototype.html);

  return instance;
};

module.exports = cheerio;
