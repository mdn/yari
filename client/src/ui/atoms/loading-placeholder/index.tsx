import "./index.scss";

export function LoadingPlaceholder({ title }: { title?: string }) {
  return (
    <>
      {title && <h1>{title}</h1>}
      <div className="page-content-container loading-placeholder"></div>
    </>
  );
}
