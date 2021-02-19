import { Titlebar } from "../../molecules/titlebar";

import "./index.scss";

export default function LoadingPlaceholder({ title }: { title?: string }) {
  return (
    <>
      {title && <Titlebar docTitle={"Loading…"} />}
      <div className="page-content-container loading-placeholder"></div>
    </>
  );
}
