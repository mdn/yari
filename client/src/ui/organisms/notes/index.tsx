import React, { useState } from "react";
import {
  Item,
  NewItem,
  useCollections,
} from "../../../plus/collections/v2/api";
import { Switch } from "../../atoms/switch";
import "./index.scss";
interface Collection {
  id: string;
  name: string;
  value: string;
}

const options: Collection[] = [
  { name: "Default", id: "1'", value: "Default" },
  { name: "Mega cool", id: "2'", value: "Default" },
  {
    value: "Default but very long annoying title omg wtf is up with this",
    name: "Default but very long annoying title omg wtf is up with this",
    id: "3'",
  },
];

export default function Notes() {
  const [selectedOption, setSelectedOption] = useState({ collection_id: "" });
  const [notesOpen, setNotesOpen] = useState(false);
  const { data: collections } = useCollections();

  const onChange = (e) => {
    const { name, value } = e.target;
    console.log(`${name} ${value}`);
    setSelectedOption({ ...selectedOption, [name]: value });
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
                value={selectedOption.collection_id}
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
        <section className="notes-container__contents">
          ermergerd swerns!
        </section>
      )}
    </section>
  );
}
