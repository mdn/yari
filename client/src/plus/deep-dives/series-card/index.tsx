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
  linkToSurvey,
}: {
  title: string;
  titleLink: string;
  seriesList: SerieData[];
  linkToSurvey: boolean;
}) {
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
      {linkToSurvey && (
        <p className="take-survey">
          <a href="#survey-form" className="take-survey-link">
            Take our survey
          </a>
        </p>
      )}
    </section>
  );
}
