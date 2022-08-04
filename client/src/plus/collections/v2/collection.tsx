import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import Container from "../../../ui/atoms/container";
import { Loading } from "../../../ui/atoms/loading";
import { Item, Collection, getItems, getCollection } from "./api";

export default function CollectionComponent() {
  const [collection, setCollection] = useState<Collection>();
  const [items, setItems] = useState<Item[]>();

  const { collectionId } = useParams();

  useEffect(() => {
    getCollection(collectionId).then(setCollection);
  }, [collectionId]);

  useEffect(() => {
    if (collection) {
      getItems(collection).then(setItems);
    }
  }, [collection]);

  return collection ? (
    <>
      <header className="plus-header">
        <Container>
          <Link to="../">Exit Collection</Link>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
        </Container>
      </header>
      <Container>
        <ul className="icon-card-list">
          {items?.map((b) => (
            <li key={b.url} className="icon-card">
              <div className="icon-card-title-wrap">
                <div className="icon-card-content">
                  <h2 className="icon-card-title">
                    <Link to={b.url}>{b.name}</Link>
                  </h2>
                </div>
              </div>
              {b.notes && <p className="icon-card-description">{b.notes}</p>}
            </li>
          ))}
        </ul>
      </Container>
    </>
  ) : (
    <Loading />
  );
}
