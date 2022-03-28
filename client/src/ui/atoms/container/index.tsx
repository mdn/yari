import "./index.scss";

export default function Container({
  children,
  extraClasses,
  optional,
}: {
  children: React.ReactNode;
  extraClasses?: string;
  optional?: boolean;
}) {
  return (
    <>
      {optional === true ? (
        <>{children}</>
      ) : (
        <div className={`container ${extraClasses || ""}`}>{children}</div>
      )}
    </>
  );
}
