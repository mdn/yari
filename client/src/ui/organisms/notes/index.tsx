import React, { useState } from "react";
import { useDocumentURL } from "../../../document/hooks";
import {
  Collection,
  Item,
  NewItem,
  useCollection,
  useCollections,
  useItems,
} from "../../../plus/collections/v2/api";
import { Switch } from "../../atoms/switch";
import "./index.scss";

export default function Notes() {
  const document = useDocumentURL();
  const [selectedCollection, setSelectedCollection] = useState<
    Collection | undefined
  >(undefined);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState<string | undefined>("");
  const { data: collections } = useCollections();
  const currentCollection = useItems(selectedCollection?.id);
  const onChange = (e) => {
    const { name, value } = e.target;
    let selected = collections?.filter((c) => c.id === value)[0];
    let notes = currentCollection?.data?.flat(1)?.filter((item) => {
      return item.url === document || undefined;
    })[0];
    setNotes(notes?.notes || undefined);
    setSelectedCollection(selected);
  };

  let options = collections?.map((val) => (
    <option key={val.id} value={val.id}>
      {val.name}
    </option>
  ));

  return (
    <section className={`notes-container ${!notesOpen ? " closed" : ""}`}>
      <section className="notes-container__header">
        <div className="notes-selector">
          {notesOpen ? (
            <>
              <p>Displaying notes from collection: </p>
              <select
                id="bookmark-collection"
                name="collection_id"
                value={selectedCollection?.id}
                autoComplete="off"
                onChange={onChange}
              >
                {options}
              </select>
            </>
          ) : (
            <p>Notes</p>
          )}
        </div>
        <div className="notes-toggle">
          <Switch
            name="notes"
            checked={notesOpen}
            toggle={(e) => {
              setNotesOpen(!notesOpen);
            }}
          ></Switch>
        </div>
      </section>
      {notesOpen && (
        <section className="notes-container__contents">{notes}</section>
      )}
    </section>
  );
}
