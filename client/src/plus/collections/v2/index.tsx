import { useState } from "react";

import Container from "../../../ui/atoms/container";
import { Button } from "../../../ui/atoms/button";
import NewCollectionModal from "./new-edit-collection-modal";
import { Route, Routes } from "react-router";
import { Collection, deleteCollection, useCollections } from "./api";
import { Link } from "react-router-dom";
import CollectionComponent from "./collection";
import {
  DropdownMenuWrapper,
  DropdownMenu,
} from "../../../ui/molecules/dropdown";
import MDNModal from "../../../ui/atoms/modal";

import "./index.scss";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function Collections() {
  return (
    <div className="collections-v2">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path=":collectionId" element={<CollectionComponent />} />
      </Routes>
    </div>
  );
}

function Overview() {
  const { data } = useCollections();

  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <header>
        <Container>
          <h1>Collections</h1>
          <Button onClickHandler={() => setShowCreate(true)}>
            New Collection
          </Button>
          <NewCollectionModal show={showCreate} setShow={setShowCreate} />
        </Container>
      </header>
      <Container>
        {data?.map((collection) => (
          <CollectionCard key={collection.id} {...{ collection }} />
        ))}
      </Container>
    </>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const deleteHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteCollection(collection);
    setShowDelete(false);
  };

  return (
    <article key={collection.id}>
      <header>
        <h2>
          <Link to={collection.id}>{collection.name}</Link>
        </h2>
        {collection.name !== "Default" ? (
          <DropdownMenuWrapper
            className="dropdown is-flush-right"
            isOpen={showDropdown}
            setIsOpen={setShowDropdown}
          >
            <Button
              type="action"
              icon="ellipses"
              ariaControls="collection-dropdown"
              ariaHasPopup="menu"
              ariaExpanded={showDropdown || undefined}
              onClickHandler={() => {
                setShowDropdown(!showDropdown);
              }}
            />
            <DropdownMenu>
              <ul className="dropdown-list" id="collection-dropdown">
                <li className="dropdown-item">
                  <Button
                    type="action"
                    title="Edit"
                    onClickHandler={() => {
                      setShowEdit(true);
                      setShowDropdown(false);
                    }}
                  >
                    Edit
                  </Button>
                </li>
                <li className="dropdown-item">
                  <Button
                    type="action"
                    title="Delete"
                    onClickHandler={() => {
                      setShowDelete(true);
                      setShowDropdown(false);
                    }}
                  >
                    Delete
                  </Button>
                </li>
              </ul>
            </DropdownMenu>
          </DropdownMenuWrapper>
        ) : null}
        <NewCollectionModal
          editingCollection={collection}
          show={showEdit}
          setShow={setShowEdit}
        />
        <MDNModal
          isOpen={showDelete}
          size="small"
          onRequestClose={() => setShowDelete(false)}
        >
          <header className="modal-header">
            <h2 className="modal-heading">Delete collection</h2>
            <Button
              onClickHandler={() => setShowDelete(false)}
              type="action"
              icon="cancel"
              extraClasses="close-button"
            />
          </header>
          <div className="modal-body">
            Are you sure you want to delete your collection "{collection.name}"?
            <div className="mdn-form-item is-button-row">
              <Button onClickHandler={deleteHandler}>Delete</Button>
              <Button
                onClickHandler={() => setShowDelete(false)}
                type="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </MDNModal>
      </header>
      {collection.description && <p>{collection.description}</p>}
      <footer>
        <span className="count">
          {collection.article_count}{" "}
          {collection.article_count === 1 ? "article" : "articles"}
        </span>
        <time dateTime={dayjs(collection.updated_at).toISOString()}>
          Edited {dayjs(collection.updated_at).fromNow().toString()}
        </time>
      </footer>
    </article>
  );
}
