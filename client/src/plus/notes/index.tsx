import { useEffect, useState } from "react";
import { Doc } from "../../../../libs/types/document";
import {
  Collection,
  Item,
  NewItem,
  useBookmark,
  useCollections,
} from "../../plus/collections/v2/api";
import { Switch } from "../../ui/atoms/switch";
import { NoteDisplay } from "./display";
import { NoteEdit } from "./edit";
import "./index.scss";

export type CollectionItemFields = {
  title: string;
  notes: string;
  collection_id: string;
};

export default function Notes({ doc }: { doc: Doc }) {
  const { data: collections } = useCollections();
  const { data: savedItems } = useBookmark(doc.mdn_url);
  const [selectedCollection, setSelectedCollection] = useState<
    Collection | undefined
  >(
    collections?.filter((c) => c.id === savedItems?.[0]?.collection_id)[0] ||
      undefined
  );
  const [notesOpen, setNotesOpen] = useState(true);
  const getNotes = (selected?, saved?) => {
    return (saved || savedItems)?.find((item) => {
      return selected?.id === item.collection_id;
    });
  };
  const [item, setItem] = useState<Item | NewItem | undefined>(
    getNotes(collections?.[0])
  );
  const onChange = (e) => {
    const { name, value } = e.target;
    let selected = collections?.filter((c) => c.id === value)[0];
    setSelectedCollection(selected);
    const i = getNotes(selected);
    setItem(i);
  };

  useEffect(() => {
    setSelectedCollection(collections?.[0]);
    setItem(getNotes(collections?.[0], savedItems));
  }, [collections, savedItems]);

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
        <Note
          doc={doc}
          item={item}
          collectionId={selectedCollection?.id || ""}
        />
      )}
    </section>
  );
}

function Note({
  item,
  doc,
  collectionId,
}: {
  item: Item | NewItem | undefined;
  doc: Doc;
  collectionId: string;
}) {
  const [edit, setEdit] = useState(false);
  return edit ? (
    <NoteEdit
      doc={doc}
      item={item}
      setEdit={setEdit}
      collectionId={collectionId}
    />
  ) : (
    <NoteDisplay
      notes={item?.notes || ""}
      title={item?.title || ""}
      setEdit={setEdit}
    />
  );
}
