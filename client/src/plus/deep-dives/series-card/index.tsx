import React from "react";

import "./index.scss";

export interface SerieData {
  displayName: string;
  slug?: string;
  state: "" | "active" | "unavailable";
}

export function SeriesCard({
  title,
  titleLink,
  seriesList,
}: {
  title: string;
  titleLink: string;
  seriesList: SerieData[];
}) {
  const SESSION_KEY = "market-research-survey-page";
  const [showTakeSurveyButton, setShowTakeSurveyButton] = React.useState(true);

  function getSessionStorageData(key: string) {
    try {
      return sessionStorage.getItem(key);
    } catch (err) {
      console.warn("Unable to get sessionStorage key");
    }
  }

  React.useEffect(() => {
    if (getSessionStorageData(SESSION_KEY) === "success") {
      setShowTakeSurveyButton(false);
    }
  }, [showTakeSurveyButton]);

  return (
    <section className="series-card" aria-labelledby="series-card-title">
      <p className="card-type">In this series</p>
      <h3 id="series-card-title">
        <a href={titleLink}>{title}</a>
      </h3>
      <ul>
        {seriesList.map((item) => {
          return (
            <li key={item.displayName} className={item.state || undefined}>
              {item.slug && item.state !== "unavailable" ? (
                <a href={item.slug}>{item.displayName}</a>
              ) : (
                item.displayName
              )}
            </li>
          );
        })}
      </ul>
      {showTakeSurveyButton && (
        <p className="take-survey">
          <a href="#survey-form" className="take-survey-link">
            Take our survey
          </a>
        </p>
      )}
    </section>
  );
}
