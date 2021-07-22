import "./index.scss";

export interface SerieData {
  displayName: string;
  slug: string;
  state: "" | "active" | "unavailable";
}

export function SeriesCard({
  title,
  seriesList,
}: {
  title: string;
  seriesList: SerieData[];
}) {
  return (
    <section className="series-card" aria-labelledby="series-card-title">
      <p className="card-type">In this series</p>
      <h3 id="series-card-title">{title}</h3>
      <ul>
        {seriesList.map((item) => {
          return (
            <li key={item.displayName} className={item.state || undefined}>
              {item.state !== "unavailable" ? (
                <a href={item.slug}>{item.displayName}</a>
              ) : (
                item.displayName
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
