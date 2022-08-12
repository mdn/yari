import { useEffect, useState } from "react";
import ".././index.scss";

import "../../icon-card/index.scss";

import Container from "../../../ui/atoms/container";
import { Button } from "../../../ui/atoms/button";
import NewCollectionModal from "./new-collection-modal";
import { Route, Routes } from "react-router";
import { Collection, getCollections } from "./api";
import { Link } from "react-router-dom";
import CollectionComponent from "./collection";

export default function Collections() {
  return (
    <Routes>
      <Route path="/" element={<Base />} />
      <Route path=":collectionId" element={<CollectionComponent />} />
    </Routes>
  );
}

function Base() {
  const [showCreate, setShowCreate] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    getCollections().then(setCollections);
  }, [setCollections]);

  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>Collections</h1>
          <Button onClickHandler={() => setShowCreate(true)}>
            Create Collection
          </Button>
          <NewCollectionModal
            show={showCreate}
            setShow={setShowCreate}
            collections={collections}
            setCollections={setCollections}
          />
        </Container>
      </header>
      <Container>
        <ul className="icon-card-list">
          {collections.map((c) => (
            <li key={c.id} className="icon-card">
              <div className="icon-card-title-wrap">
                <div className="icon-card-content">
                  <h2 className="icon-card-title">
                    <Link to={c.id}>{c.title}</Link>
                  </h2>
                </div>
              </div>
              {c.description && (
                <p className="icon-card-description">{c.description}</p>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
