import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { SeriesCard, SerieData } from "./series-card";

import "./index.scss";
import { DeepDiveNotFound } from "./not-found";
import { ProductTeaser } from "../../ui/organisms/product-teaser";
import { Survey } from "./survey";
import {
  YourBrowserSupportToolkit,
  PlanningForBrowserSupport,
} from "./sample-articles";

const SERIES = [
  {
    slug: "planning-for-browser-support",
    title: "Planning for browser support",
  },
  {
    slug: "your-browser-support-toolkit",
    title: "Your browser support toolkit",
  },
];

export default function Article({ slug }: { slug: string }) {
  const [hasFinishedSurvey, setHasFinishedSurvey] = useState(false);

  // Only when served via static Express does it force a trailing
  // slash to the end of the URL. So we have to, for testing reasons,
  // remove any trailing slashes.
  if (slug.endsWith("/")) {
    slug = slug.slice(0, -1);
  }

  useEffect(() => {
    const serie = SERIES.find(
      (serie) => serie.slug.toLowerCase() === slug.toLowerCase()
    );
    const title = serie ? serie.title : "Article not found";
    document.title = title;
  }, [slug]);
  const { locale } = useParams();

  function getSeriesList(): SerieData[] {
    const list: SerieData[] = [];
    for (const serie of SERIES) {
      list.push({
        displayName: serie.title,
        slug: serie.slug,
        state: serie.slug === slug.toLowerCase() ? "active" : "",
      });
    }
    // Cheating a bit here manually adding one that *could be*.
    list.push({
      displayName: "Practical browser support",
      state: "unavailable",
    });
    return list;
  }

  const serie = SERIES.find(
    (serie) => serie.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!serie) {
    return (
      <div className="main-article-page-content-container girdle">
        <DeepDiveNotFound slug={slug} />
      </div>
    );
  }
  const article =
    serie.slug === "planning-for-browser-support" ? (
      <PlanningForBrowserSupport />
    ) : serie.slug === "your-browser-support-toolkit" ? (
      <YourBrowserSupportToolkit />
    ) : null;

  // XXX rewrite so it's dynamic based on .findIndex() based on 'slug'
  const previousArticle =
    serie.slug === "your-browser-support-toolkit" ? SERIES[0] : null;
  const nextArticle =
    serie.slug === "planning-for-browser-support" ? SERIES[1] : null;

  return (
    <>
      <div className="main-article-page-content-container girdle">
        {article}

        <div className="deep-dive-article-sidebar">
          <SeriesCard
            title="Modern CSS in the Real World"
            titleLink={`/${locale}/plus/deep-dives`}
            seriesList={getSeriesList()}
            linkToSurvey={!hasFinishedSurvey}
          />
        </div>
      </div>
      <ProductTeaser />
      <Survey
        slug={slug}
        hasFinished={() => {
          setHasFinishedSurvey(true);
        }}
      />
      <div
        className={`deep-dive-article-footer ${
          previousArticle ? "previous" : ""
        }`}
      >
        <p className="girdle">
          {nextArticle && (
            <a href={`/${locale}/plus/deep-dives/${nextArticle.slug}`}>
              <span className="next-article">Next article</span>{" "}
              {nextArticle.title}
            </a>
          )}
          {previousArticle && (
            <a href={`/${locale}/plus/deep-dives/${previousArticle.slug}`}>
              <span className="previous-article">Previous article</span>{" "}
              {previousArticle.title}
            </a>
          )}
        </p>
      </div>
      {!hasFinishedSurvey && (
        <div className="take-survey-mobile">
          <a href="#survey-form" className="take-survey-link">
            Take our survey
          </a>
        </div>
      )}
    </>
  );
}
