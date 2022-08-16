import { useEffect, useState } from "react";

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

export default function Collections() {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path=":collectionId" element={<CollectionComponent />} />
    </Routes>
  );
}

function Overview() {
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
            <CollectionCard key={collection.id} {...{ collection }} />
          ))}
        </ul>
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
    setShowDropdown(false);
  };

  return (
    <li key={collection.id} className="icon-card">
      <div className="icon-card-title-wrap">
        <div className="icon-card-content">
          <h2 className="icon-card-title">
            <Link to={collection.id}>{collection.name}</Link>
          </h2>
        </div>
        <DropdownMenuWrapper
          className="dropdown is-flush-right"
          isOpen={showDropdown}
          setIsOpen={setShowDropdown}
          disableAutoClose={showEdit || showDelete}
        >
          <Button
            type="action"
            icon="ellipses"
            ariaControls="collection-dropdown"
            ariaHasPopup={"menu"}
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
                  onClickHandler={() => setShowEdit(true)}
                >
                  Edit
                </Button>
                <NewCollectionModal
                  editingCollection={collection}
                  show={showEdit}
                  setShow={setShowEdit}
                />
              </li>
              <li className="dropdown-item">
                <Button
                  type="action"
                  title="Delete"
                  onClickHandler={() => setShowDelete(true)}
                >
                  Delete
                </Button>
                <MDNModal
                  isOpen={showDelete}
                  size="small"
                  onRequestClose={() => setShowDelete(false)}
                >
                  <header className="modal-header">
                    <h2 className="modal-heading">
                      Are you sure you want to delete your collection "
                      {collection.name}"
                    </h2>
                    <Button
                      onClickHandler={() => setShowDelete(false)}
                      type="action"
                      icon="cancel"
                      extraClasses="close-button"
                    />
                  </header>
                  <div className="modal-body">
                    <div className="watch-submenu-item border-top-0 is-button-row is-always-visible">
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
              </li>
            </ul>
          </DropdownMenu>
        </DropdownMenuWrapper>
      </div>
      {collection.description && (
        <p className="icon-card-description">{collection.description}</p>
      )}
    </li>
  );
}
