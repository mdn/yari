import React, { useState } from "react";

import Container from "../../../ui/atoms/container";
import { Button } from "../../../ui/atoms/button";
import NewEditCollectionModal from "./new-edit-collection-modal";
import { Route, Routes } from "react-router";
import { Collection, useCollectionDelete, useCollections } from "./api";
import { Link } from "react-router-dom";
import CollectionComponent from "./collection";
import {
  DropdownMenuWrapper,
  DropdownMenu,
} from "../../../ui/molecules/dropdown";
import MDNModal from "../../../ui/atoms/modal";
import { Loading } from "../../../ui/atoms/loading";
import NoteCard from "../../../ui/molecules/notecards";

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
  const { data, isLoading, error } = useCollections();

  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <header>
        <Container>
          <h1>Collections</h1>
          <Button
            onClickHandler={() => setShowCreate(true)}
            isDisabled={isLoading}
          >
            New Collection
          </Button>
          <NewEditCollectionModal show={showCreate} setShow={setShowCreate} />
        </Container>
      </header>
      <Container>
        {isLoading ? (
          <Loading />
        ) : data ? (
          data.map((collection) => (
            <CollectionCard key={collection.id} {...{ collection }} />
          ))
        ) : error ? (
          <NoteCard type="error">
            <h4>Error</h4>
            <p>{error.message}</p>
          </NoteCard>
        ) : (
          "Create a new collection..."
        )}
      </Container>
    </>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const {
    mutator: deleter,
    error,
    resetError,
    isPending,
  } = useCollectionDelete();

  const deleteHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPending) return;
    await deleter(collection);
    setShowDelete(false);
  };

  const deleteCancelHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPending) return;
    resetError();
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
        <NewEditCollectionModal
          editingCollection={collection}
          show={showEdit}
          setShow={setShowEdit}
        />
        <MDNModal
          isOpen={showDelete}
          size="small"
          onRequestClose={deleteCancelHandler}
          extraOverlayClassName={isPending ? "wait" : ""}
        >
          <header className="modal-header">
            <h2 className="modal-heading">Delete collection</h2>
            <Button
              onClickHandler={deleteCancelHandler}
              type="action"
              icon="cancel"
              extraClasses="close-button"
            />
          </header>
          <div className="modal-body">
            {error && (
              <NoteCard type="error">
                <p>Error: {error.message}</p>
              </NoteCard>
            )}
            <p>
              Are you sure you want to delete your collection "{collection.name}
              "?
            </p>
            <div className="mdn-form-item is-button-row">
              <Button onClickHandler={deleteHandler} isDisabled={isPending}>
                {isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button
                onClickHandler={deleteCancelHandler}
                type="secondary"
                isDisabled={isPending}
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
