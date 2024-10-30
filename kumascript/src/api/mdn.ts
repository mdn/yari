import got from "got";
import { KumaThis } from "../environment.js";
import * as util from "./util.js";

// Module level caching for repeat calls to fetchWebExtExamples().
let webExtExamples: any = null;

const mdn = {
  /**
   * Given a set of names and a corresponding list of values, apply HTML
   * escaping to each of the values and return an object with the results
   * associated with the names.
   */
  htmlEscapeArgs(names, args) {
    const e = {};
    names.forEach(function (name, idx) {
      e[name] = util.htmlEscape(args[idx]);
    });
    return e;
  },

  htmlEscape: util.htmlEscape,

  /**
   * Given a set of strings like this:
   *     { "en-US": "Foo", "es": "Baz", "fr": "Bar" }
   * Return the one which matches the current locale.
   */
  localString(this: KumaThis, strings) {
    let lang = this.env.locale;
    if (!(lang in strings)) lang = "en-US";
    return strings[lang];
  },

  /**
   * Given a set of string maps like this:
   *     { "en-US": {"name": "Foo"}, "fr": {"name": "Bar"} }
   * Return a map which matches the current locale, falling back to en-US
   * properties when the localized map contains partial properties.
   */
  localStringMap(this: KumaThis, maps) {
    const lang = this.env.locale;
    const defaultMap = maps["en-US"];
    if (lang == "en-US" || !(lang in maps)) {
      return defaultMap;
    }
    const localizedMap = maps[lang];
    const map = {};
    for (const name in defaultMap) {
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
   *    "hello": { "en-US": "Hello!", "fr": "Bonjour !" },
   *    "bye": { "en-US": "Goodbye!", "fr": "Au revoir !" }
   *   }
   * Returns the one, which matches the current locale.
   *
   * Example:
   *   getLocalString({"hello": {"en-US": "Hello!", "fr": "Bonjour !"}},
   *       "hello");
   *   => "Bonjour !" (in case the locale is 'fr')
   */
  getLocalString(this: KumaThis, strings, key) {
    if (!Object.prototype.hasOwnProperty.call(strings, key)) {
      return key;
    }

    let lang = this.env.locale;
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
      let index = placeholder.substring(1, placeholder.length - 1);
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

  /**
   * Throw a deprecation error.
   */
  deprecated(
    this: KumaThis,
    message = "This macro has been deprecated, and should be removed."
  ) {
    this.env.recordNonFatalError("deprecated", message);
  },

  /**
   * Throw a deprecation error for parameters to macros.
   */
  deprecatedParams(
    this: KumaThis,
    message = "Parameters for this macro have been deprecated and should be removed."
  ) {
    this.env.recordNonFatalError("deprecated", message);
  },

  async fetchWebExtExamples() {
    if (!webExtExamples) {
      try {
        webExtExamples = await got(
          "https://raw.githubusercontent.com/mdn/webextensions-examples/master/examples.json",
          {
            timeout: { request: 1000 },
            retry: { limit: 5 },
          }
        ).json();
      } catch (error) {
        webExtExamples = error;
      }
    }
    if (webExtExamples instanceof Error) {
      // This will result in a macro flaw for every call of the WebExtExamples or
      // WebExtAllExamples macro. We create a fresh instance of Error each time,
      // because the EJS code will add traceback information to its message.
      throw new Error(webExtExamples.toString());
    }
    return webExtExamples;
  },
};

export default mdn;
