import { useEffect, useState } from "react";
import ".././index.scss";

import "../../icon-card/index.scss";

import Container from "../../../ui/atoms/container";
import { Button } from "../../../ui/atoms/button";
import NewCollectionModal from "./new-collection-modal";
import { Route, Routes } from "react-router";
import { Collection, useCollections } from "./api";
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
  const { data } = useCollections();

  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>Collections</h1>
          <Button onClickHandler={() => setShowCreate(true)}>
            Create Collection
          </Button>
          <NewCollectionModal show={showCreate} setShow={setShowCreate} />
        </Container>
      </header>
      <Container>
        <ul className="icon-card-list">
          {data?.map((collection) => (
            <li key={collection.id} className="icon-card">
              <div className="icon-card-title-wrap">
                <div className="icon-card-content">
                  <h2 className="icon-card-title">
                    <Link to={collection.id}>{collection.name}</Link>
                  </h2>
                </div>
              </div>
              {collection.description && (
                <p className="icon-card-description">
                  {collection.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
