import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { Button } from "../../../ui/atoms/button";
import Container from "../../../ui/atoms/container";
import { Loading } from "../../../ui/atoms/loading";
import { useCollection, useItems } from "./api";

export default function CollectionComponent() {
  const { collectionId } = useParams();
  const { data: collection } = useCollection(collectionId);
  const { data: items, size, setSize } = useItems(collectionId);

  return collection ? (
    <>
      <header className="plus-header">
        <Container>
          <Link to="../">Exit Collection</Link>
          <h1>{collection.name}</h1>
          <p>{collection.description}</p>
        </Container>
      </header>
      <Container>
        <ul className="icon-card-list">
          {items?.map((item) => (
            <li key={item.url} className="icon-card">
              <div className="icon-card-title-wrap">
                <div className="icon-card-content">
                  <h2 className="icon-card-title">
                    <Link to={item.url}>{item.title}</Link>
                  </h2>
                </div>
              </div>
              {item.notes && (
                <p className="icon-card-description">{item.notes}</p>
              )}
            </li>
          ))}
        </ul>
        <div className="pagination">
          <Button
            type="primary"
            onClickHandler={() => {
              setSize(size + 1);
            }}
          >
            Show more
          </Button>
        </div>
      </Container>
    </>
  ) : (
    <Loading />
  );
}
