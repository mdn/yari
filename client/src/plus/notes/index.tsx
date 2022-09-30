import { createRef, useEffect, useState } from "react";
import { marked } from "marked";

import "./index.scss";

marked.use({
  html() {
    return "";
  },
});

enum View {
  Edit,
  Preview,
}

export function Note() {
  const ref = createRef<HTMLTextAreaElement>();
  let [view, setView] = useState<View>(View.Edit);
  let [html, setHtml] = useState("");
  useEffect(() => {
    if (view === View.Preview) {
      setHtml(marked.parse(ref.current?.value || ""));
    }
  }, [view]);
  return (
    <div className="col-note">
      <div className="col-note-tabs">
        <div className="title-edit"></div>
        <button
          onClick={() => setView(View.Edit)}
          className={`${view === View.Edit ? "active" : "inactive"}`}
        >
          Edit
        </button>
        <button
          onClick={() => setView(View.Preview)}
          className={`${view === View.Preview ? "active" : "inactive"}`}
        >
          Preview
        </button>
      </div>
      <div
        className={`note edit ${view === View.Edit ? "active" : "inactive"}`}
      >
        <textarea ref={ref}></textarea>
      </div>
      <div
        className={`note preview ${
          view === View.Preview ? "active" : "inactive"
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
      <div className="actions">
        <button>Cancel</button>
        <button>Save</button>
      </div>
    </div>
  );
}
