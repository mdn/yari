import React, { useState } from "react";

import Container from "../../ui/atoms/container";
import { Button } from "../../ui/atoms/button";
import NewEditCollectionModal from "./new-edit-collection-modal";
import { Route, Routes } from "react-router";
import { Collection, useCollectionDelete, useCollections } from "./api";
import { Link } from "react-router-dom";
import {
  CollectionComponent,
  FrequentlyViewedCollectionComponent,
} from "./collection";
import { DropdownMenuWrapper, DropdownMenu } from "../../ui/molecules/dropdown";
import MDNModal from "../../ui/atoms/modal";
import { Loading } from "../../ui/atoms/loading";
import NoteCard from "../../ui/molecules/notecards";

import "./index.scss";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Mandala from "../../ui/molecules/mandala";
import { useGleanClick } from "../../telemetry/glean-context";
import {
  COLLECTIONS_BANNER_NEW_COLLECTION,
  NEW_COLLECTION_MODAL_SUBMIT_COLLECTIONS_PAGE,
} from "../../telemetry/constants";
import { camelWrap } from "../../utils";
import { useFrequentlyViewed } from "./frequently-viewed";
import { Icon } from "../../ui/atoms/icon";
import { MDN_PLUS_TITLE } from "../../constants";
import { SWRConfig } from "swr";
dayjs.extend(relativeTime);

const swrConfig = { revalidateOnFocus: false, revalidateIfStale: false };
export default function Collections() {
  return (
    <SWRConfig value={swrConfig}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route
          path="frequently-viewed"
          element={<FrequentlyViewedCollectionComponent />}
        />
        <Route path=":collectionId" element={<CollectionComponent />} />
      </Routes>
    </SWRConfig>
  );
}

function Overview() {
  document.title = `Collections | ${MDN_PLUS_TITLE}`;
  const { data, isLoading, error } = useCollections();
  const [showCreate, setShowCreate] = useState(false);
  const gleanClick = useGleanClick();

  let collectionCards = data?.map((collection) => (
    <CollectionCard key={collection.id} {...{ collection }} />
  ));
  const frequentlyViewedCard = (
    <FrequentlyViewedCollectionCard key={"frequently-viewed"} />
  );
  if (collectionCards && frequentlyViewedCard) {
    collectionCards.splice(1, 0, frequentlyViewedCard);
  }

  return (
    <div className="collections collections-overview">
      <header className="plus-header-mandala">
        <Container>
          <h1>
            <div className="mandala-icon-wrapper">
              <Mandala rotate={true} />
              <Icon name="bookmark-filled" />
            </div>
            <span>Collections</span>
          </h1>
          <p>
            Save and group your favorite MDN articles to easily find them later
            on.
            <br />
            <a
              rel="noreferrer noopener"
              target="_blank"
              href="https://survey.alchemer.com/s3/6988450/Feature-Preview-User-Feedback-Multiple-Collections"
            >
              We'd love to hear your feedback!
            </a>
          </p>
          <Button
            onClickHandler={() => {
              gleanClick(COLLECTIONS_BANNER_NEW_COLLECTION);
              setShowCreate(true);
            }}
            isDisabled={isLoading}
          >
            New Collection
          </Button>
          <NewEditCollectionModal
            show={showCreate}
            setShow={setShowCreate}
            source={NEW_COLLECTION_MODAL_SUBMIT_COLLECTIONS_PAGE}
          />
        </Container>
      </header>
      <Container>
        {isLoading ? (
          <Loading />
        ) : data ? (
          collectionCards
        ) : error ? (
          <NoteCard type="error">
            <h4>Error</h4>
            <p>{error.message}</p>
          </NoteCard>
        ) : (
          "Create a new collection..."
        )}
      </Container>
    </div>
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

  return collection.name === "Default" ? (
    <DefaultCollectionCard collection={collection} />
  ) : (
    <article key={collection.id}>
      <header>
        <h2>
          <Link to={collection.id}>{camelWrap(collection.name)}</Link>
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
              aria-controls="collection-dropdown"
              aria-haspopup="menu"
              aria-expanded={showDropdown || undefined}
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
          source={NEW_COLLECTION_MODAL_SUBMIT_COLLECTIONS_PAGE}
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
      {collection.description && <p>{camelWrap(collection.description)}</p>}
      <footer>
        <Link to={collection.id} className="count">
          {collection.article_count}{" "}
          {collection.article_count === 1 ? "article" : "articles"}
        </Link>
        <time dateTime={dayjs(collection.updated_at).toISOString()}>
          Edited {dayjs(collection.updated_at).fromNow().toString()}
        </time>
      </footer>
    </article>
  );
}

function DefaultCollectionCard({ collection }: { collection: Collection }) {
  return (
    <article key={collection.id} className="default">
      <header>
        <h2>
          <Link to={collection.id}>Saved Articles</Link>
        </h2>
      </header>
      <p>The default collection.</p>
      <footer>
        <Link to={collection.id} className="count">
          {collection.article_count}{" "}
          {collection.article_count === 1 ? "article" : "articles"}
        </Link>
        <time dateTime={dayjs(collection.updated_at).toISOString()}>
          Edited {dayjs(collection.updated_at).fromNow().toString()}
        </time>
      </footer>
    </article>
  );
}

function FrequentlyViewedCollectionCard() {
  const collection = useFrequentlyViewed();
  if (!collection.items.length) {
    return null;
  }
  return (
    <article key={collection.name} className="default">
      <header>
        <h2>
          <Link to={"frequently-viewed"}>{collection.name}</Link>
        </h2>
      </header>
      <p>{collection.description}</p>
      <footer>
        <Link to={"frequently-viewed"} className="count">
          {collection.article_count}{" "}
          {collection.article_count === 1 ? "article" : "articles"}
        </Link>
        <time dateTime={dayjs(collection.updated_at).toISOString()}>
          Updated {dayjs(collection.updated_at).fromNow().toString()}
        </time>
      </footer>
    </article>
  );
}
