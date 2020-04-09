/**
 * @prettier
 */
const url = require("url");
const got = require("got");

const util = require("./util.js");
const cache = require("../cache.js");

module.exports = {
  /**
   * Given a set of names and a corresponding list of values, apply HTML
   * escaping to each of the values and return an object with the results
   * associated with the names.
   */
  htmlEscapeArgs(names, args) {
    var e = {};
    names.forEach(function (name, idx) {
      e[name] = util.htmlEscape(args[idx]);
    });
    return e;
  },

  /**
   * Given a set of strings like this:
   *     { "en-US": "Foo", "de": "Bar", "es": "Baz" }
   * Return the one which matches the current locale.
   */
  localString(strings) {
    var lang = this.env.locale;
    if (!(lang in strings)) lang = "en-US";
    return strings[lang];
  },

  /**
   * Given a set of string maps like this:
   *     { "en-US": {"name": "Foo"}, "de": {"name": "Bar"} }
   * Return a map which matches the current locale, falling back to en-US
   * properties when the localized map contains partial properties.
   */
  localStringMap(maps) {
    var lang = this.env.locale;
    var defaultMap = maps["en-US"];
    if (lang == "en-US" || !(lang in maps)) {
      return defaultMap;
    }
    var localizedMap = maps[lang];
    var map = {};
    for (var name in defaultMap) {
      if (name in localizedMap) {
        map[name] = localizedMap[name];
      } else {
        map[name] = defaultMap[name];
      }
    }
    return map;
  },

  /**
   * Given a set of strings like this:
   *   {
   *    "hello": { "en-US": "Hello!", "de": "Hallo!" },
   *    "bye": { "en-US": "Goodbye!", "de": "Auf Wiedersehen!" }
   *   }
   * Returns the one, which matches the current locale.
   *
   * Example:
   *   getLocalString({"hello": {"en-US": "Hello!", "de": "Hallo!"}},
   *       "hello");
   *   => "Hallo!" (in case the locale is 'de')
   */
  getLocalString(strings, key) {
    if (!strings.hasOwnProperty(key)) {
      return key;
    }

    var lang = this.env.locale;
    if (!(lang in strings[key])) {
      lang = "en-US";
    }

    return strings[key][lang];
  },

  /**
   * Given a string, replaces all placeholders outlined by
   * $1$, $2$, etc. (i.e. numeric placeholders) or
   * $firstVariable$, $secondVariable$, etc. (i.e. string placeholders)
   * within it.
   *
   * If numeric placeholders are used, the 'replacements' parameter
   * must be an array. The number within the placeholder indicates
   * the index within the replacement array starting by 1.  If
   * string placeholders are used, the 'replacements' parameter must
   * be an object. Its property names represent the placeholder
   * names and their values the values to be inserted.
   *
   * Examples:
   *   replacePlaceholders("$1$ $2$, $1$ $3$!",
   *                       ["hello", "world", "contributor"])
   *   => "hello world, hello contributor!"
   *
   *   replacePlaceholders("$hello$ $world$, $hello$ $contributor$!",
   *       {hello: "hallo", world: "Welt", contributor: "Mitwirkender"})
   *   => "hallo Welt, hallo Mitwirkender!"
   */
  replacePlaceholders(string, replacements) {
    function replacePlaceholder(placeholder) {
      var index = placeholder.substring(1, placeholder.length - 1);
      if (!Number.isNaN(Number(index))) {
        index--;
      }
      return index in replacements ? replacements[index] : "";
    }

    return string.replace(/\$\w+\$/g, replacePlaceholder);
  },

  /**
   * Given a string, escapes all quotes within it.
   */
  escapeQuotes: util.escapeQuotes,

  // Fetch an HTTP resource with JSON representation, parse the JSON and
  // return a JS object.
  async fetchJSONResource(url, opts) {
    opts = util.defaults(opts || {}, {
      headers: {
        "Cache-Control": this.env.cache_control,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return JSON.parse(await this.MDN.fetchHTTPResource(url, opts));
  },

  // Fetch an HTTP resource, return the response body.
  async fetchHTTPResource(url, opts) {
    opts = util.defaults(opts || {}, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "Content-Type": "text/plain",
      },
      url: url,
    });

    async function fetchBody() {
      try {
        const response = await got(opts);
        if (response.statusCode == 200) {
          return response.body;
        }
      } catch (e) {}
      return null;
    }

    const cache_key = "kuma:http_resource:" + url.toLowerCase();

    return await cache(cache_key, fetchBody);
  },

  /* Derive the site URL from the request URL */
  siteURL() {
    var p = url.parse(this.env.url, true),
      site_url = p.protocol + "//" + p.host;
    return site_url;
  },
};
