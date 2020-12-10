/**
 * Return the array of translations, in the same original order, but with some
 * filtered out.
 *
 * In the Wiki we would sometimes get multiple translations, within the same locale,
 * that point to the same English document. This could happens if an English page
 * was created, was translated, and then moved to a new slug, and this made
 * translators think that new slug is a different document, when in fact it was
 * just the English document getting a new slug.
 * Essentially, this is a hangover from the Wiki mess.
 *
 * For example, see https://github.com/mdn/yari/issues/2034 which lists
 * two Japanese documents that both point to the same (after following redirects)
 * English document.
 *
 * In this function we clean that up so we only return an array where each locale
 * is only mentioned once.
 * The naive implementation here is that it needs to pick one. The way it knows
 * /which/ one to pick is hand-wavy. In this function we use the hope that one
 * of them has a different `.original` and the one that doesn't
 * is the one we keep. E.g.
 *
 *  ...
 *  {
      url: "/ja/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "ja",
      title: "JavaScript の基本",
    },
    {
      url: "/ja/docs/Web/JavaScript/Getting_Started",
      locale: "ja",
      title: "Getting Started (Javascript Tutorial)",
      original: "Web/JavaScript/Getting_Started",
    },
    ...
 *
 * In this case, let's only keep the
 * `/ja/docs/Learn/Getting_started_with_the_web/JavaScript_basics` one because
 * the `/ja/docs/Web/JavaScript/Getting_Started` /has/ a `.original`.
 *
 * But note! It's not a guarantee that the order of these two is predictable.
 * So, we need to compare both of them.
 *
 * @param {Array} translations
 * @param {string} enUSURL
 */
function uniqifyTranslationsOf(translations, enUSURL) {
  // First figure out if there's a problem and if we need to do any filtering.
  const locales = translations.map((translation) => translation.locale);
  const localesSet = new Set(locales);
  if (locales.length === localesSet.size) {
    // Nothing needs to be done.
    return translations;
  }
  // Group them by locale
  const groups = new Map();
  for (const translation of translations) {
    if (!groups.has(translation.locale)) {
      groups.set(translation.locale, []);
    }
    groups.get(translation.locale).push(translation);
  }
  // Now sort each group so the "best one" (see logn comment above)
  // so the best one comes first.
  for (const [locale, choices] of groups) {
    groups.set(locale, sortChoices(choices, enUSURL));
  }
  // Now, for each group we can pick the first one
  const filteredTranslations = [];
  const seenLocales = new Set();
  for (const translation of translations) {
    if (groups.has(translation.locale)) {
      if (!seenLocales.has(translation.locale)) {
        filteredTranslations.push(groups.get(translation.locale)[0]);
        seenLocales.add(translation.locale);
      }
    } else {
      filteredTranslations.push(translation);
    }
  }
  return filteredTranslations;
}

function sortChoices(choices, enUSURL) {
  return choices.sort((a, b) => {
    if (a.original && !b.original) {
      return 1;
    } else if (b.original && !a.original) {
      return -1;
    } else if (a.original && b.original) {
      if (enUSURL.endsWith(a.original)) {
        return -1;
      } else if (enUSURL.endsWith(b.original)) {
        return 1;
      }
    } else {
      // Not much we can do here. Sorry! It's impossible to pick a "best one".
      // We're going to just "randomly" pick one.
    }
    return 0;
  });
}

const test = () => {
  const translations = [
    {
      url: "/fr/docs/Web/JavaScript/guide_de_demarrage",
      locale: "fr",
      title: "Tutoriel pour débuter en JavaScript",
      original: "Web/JavaScript/Getting_Started",
    },
    {
      url: "/fr/docs/Apprendre/Commencer_avec_le_web/Les_bases_JavaScript",
      locale: "fr",
      title: "Les bases de JavaScript",
      original: "Learn/Getting_started_with_the_web/JavaScript_basics",
    },

    {
      url: "/it/docs/Web/JavaScript/Getting_Started",
      locale: "it",
      title: "Getting Started (JavaScript Tutorial)",
      original: "Web/JavaScript/Getting_Started",
    },
    {
      url: "/it/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "it",
      title: "Basi di JavaScript",
    },

    {
      url: "/ja/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "ja",
      title: "JavaScript の基本",
    },
    {
      url: "/ja/docs/Web/JavaScript/Getting_Started",
      locale: "ja",
      title: "Getting Started (Javascript Tutorial)",
      original: "Web/JavaScript/Getting_Started",
    },
    {
      url: "/zh-TW/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "zh-TW",
      title: "JavaScript 基礎",
    },

    {
      url: "/ko/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "ko",
      title: "JavaScript 기본",
    },
    {
      url: "/ko/docs/Web/JavaScript/시작하기",
      locale: "ko",
      title: "시작하기 (자바스크립트 튜토리얼)",
    },
  ];
  const newTranslations = uniqifyTranslationsOf(
    translations,
    "/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics"
  );

  const expectedResult = [
    {
      url: "/fr/docs/Apprendre/Commencer_avec_le_web/Les_bases_JavaScript",
      locale: "fr",
      title: "Les bases de JavaScript",
      original: "Learn/Getting_started_with_the_web/JavaScript_basics",
    },
    {
      url: "/it/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "it",
      title: "Basi di JavaScript",
    },
    {
      url: "/ja/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "ja",
      title: "JavaScript の基本",
    },
    {
      url: "/zh-TW/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "zh-TW",
      title: "JavaScript 基礎",
    },
    {
      url: "/ko/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
      locale: "ko",
      title: "JavaScript 기본",
    },
  ];
  console.assert(newTranslations.length === expectedResult.length);
  newTranslations.forEach((translation, i) => {
    console.assert(translation.locale === expectedResult[i].locale);
    console.assert(translation.original === expectedResult[i].original);
    console.assert(translation.title === expectedResult[i].title);
  });
};
// Uncomment to run the tests
// test();

module.exports = {
  uniqifyTranslationsOf,
};
