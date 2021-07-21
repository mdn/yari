import "./index.scss";

const SeriesCard = ({ title, seriesList }) => {
  return (
    <section className="series-card" aria-labelledby="series-card-title">
      <p className="card-type">In this series</p>
      <h3 id="series-card-title">{title}</h3>
      <ul>
        {seriesList.map((item) => {
          return (
            <li key={item.displayName} className={item.state || null}>
              {item.state !== "unavailable" ? (
                <a href={item.url}>{item.displayName}</a>
              ) : (
                item.displayName
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default SeriesCard;
