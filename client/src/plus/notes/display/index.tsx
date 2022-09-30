import { marked } from "marked";
import { Button } from "../../../ui/atoms/button";

import "./index.scss";

marked.use({
  html() {
    return "";
  },
});

export function NoteDisplay({
  notes,
  title,
  setEdit,
}: {
  notes: string;
  title: string;
  setEdit: Function;
}) {
  return (
    <div className="note-display">
      <Button
        type="action"
        icon="edit"
        onClickHandler={() => setEdit(true)}
      ></Button>
      <span>
        <strong>{title}</strong>
      </span>
      {notes && (
        <p dangerouslySetInnerHTML={{ __html: marked.parse(notes || "") }}></p>
      )}
    </div>
  );
}
