import "./index.scss";

export function Card({
  featured,
  children,
}: {
  featured: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={featured ? "card featured" : "card"}
      aria-labelledby="card-title"
    >
      {children}
    </section>
  );
}
