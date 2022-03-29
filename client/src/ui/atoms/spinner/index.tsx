import "./index.scss";

export function Spinner({ extraClasses }: { extraClasses?: string | null }) {
  return (
    <div className={`spinner ${extraClasses || ""}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
