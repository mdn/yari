import "./index.scss";

const Card = ({ featured, children }) => {
  return (
    <section
      className={featured ? "card featured" : "card"}
      aria-labelledby="card-title"
    >
      {children}
    </section>
  );
};

export default Card;
