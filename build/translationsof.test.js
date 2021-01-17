const { uniqifyTranslationsOf } = require("./translationsof");

describe("test uniqifyTranslationsOf function", () => {
  it("should do nothing if there's nothing to translate", () => {
    const translations = [
      {
        url: "/fr/docs/Web/JavaScript/guide_de_demarrage",
        locale: "fr",
        title: "Tutoriel pour débuter en JavaScript",
      },
      {
        url: "/it/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
        locale: "it",
        title: "Basi di JavaScript",
      },
    ];
    const newTranslations = uniqifyTranslationsOf(
      translations,
      "/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics"
    );
    expect(newTranslations.length).toBe(translations.length);
    newTranslations.forEach((translation, i) => {
      expect(translation.locale).toBe(translations[i].locale);
      expect(translation.original).toBe(translations[i].original);
      expect(translation.title).toBe(translations[i].title);
    });
  });

  it("should filter correctly", () => {
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
    expect(newTranslations.length).toBe(expectedResult.length);
    newTranslations.forEach((translation, i) => {
      expect(translation.locale).toBe(expectedResult[i].locale);
      expect(translation.original).toBe(expectedResult[i].original);
      expect(translation.title).toBe(expectedResult[i].title);
    });
  });
});
