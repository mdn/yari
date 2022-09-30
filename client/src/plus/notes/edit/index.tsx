import { createRef, useEffect, useState } from "react";
import { marked } from "marked";

import "./index.scss";
import {
  Item,
  NewItem,
  useItemAdd,
  useItemDelete,
  useItemEdit,
} from "../../collections/v2/api";
import { Doc } from "../../../../../libs/types/document";

marked.use({
  html() {
    return "";
  },
});

enum View {
  Edit,
  Preview,
}

export function NoteEdit({
  doc,
  item,
  setEdit,
  collectionId,
}: {
  doc: Doc;
  item: Item | NewItem | undefined;
  setEdit: Function;
  collectionId: string;
}) {
  const ref = createRef<HTMLTextAreaElement>();
  let [view, setView] = useState<View>(View.Edit);
  let [html, setHtml] = useState("");

  const defaultItem: NewItem = {
    url: doc.mdn_url,
    title: item?.title || doc.title,
    notes: item?.notes,
    collection_id: item?.collection_id || collectionId,
  };

  const [formItem, setFormItem] = useState<Item | NewItem>(defaultItem);
  const { mutator: addItem } = useItemAdd();
  const { mutator: editItem } = useItemEdit();
  const { mutator: deleteItem } = useItemDelete();

  const changeHandler = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    console.log(name, value);
    setFormItem({ ...formItem, [name]: value });
  };
  useEffect(() => {
    if (view === View.Preview) {
      setHtml(marked.parse(ref.current?.value || ""));
    }
  }, [view]);

  useEffect(() => {
    setFormItem({ ...formItem, ...item });
  }, [item]);

  const saveHandler = async (
    e: React.FormEvent<HTMLFormElement> | React.BaseSyntheticEvent
  ) => {
    e.preventDefault();
    if ("id" in formItem) {
      await editItem(formItem);
    } else {
      console.log(formItem);
      await addItem(formItem);
    }
    setEdit(false);
  };

  return (
    <div className="col-note">
      <div className="col-note-tabs">
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
        {view === View.Edit ? (
          <input
            className="title"
            name="title"
            onChange={changeHandler}
            value={formItem?.title}
          />
        ) : (
          <span className="title">{formItem?.title}</span>
        )}
      </div>
      <div
        className={`note edit ${view === View.Edit ? "active" : "inactive"}`}
      >
        <textarea
          rows={4}
          ref={ref}
          name="notes"
          value={formItem.notes}
          onChange={changeHandler}
        ></textarea>
      </div>
      <div
        className={`note preview ${
          view === View.Preview ? "active" : "inactive"
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
      <div className="actions">
        <button onClick={() => setEdit(false)}>Cancel</button>
        <button onClick={saveHandler}>Save</button>
      </div>
    </div>
  );
}
