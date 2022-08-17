import { useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { KeyedMutator, useSWRConfig } from "swr";
import { Button } from "../../../ui/atoms/button";
import Container from "../../../ui/atoms/container";
import { Loading } from "../../../ui/atoms/loading";
import MDNModal from "../../../ui/atoms/modal";
import {
  DropdownMenu,
  DropdownMenuWrapper,
} from "../../../ui/molecules/dropdown";
import { deleteItem, editItem, Item, useCollection, useItems } from "./api";

export default function CollectionComponent() {
  const { collectionId } = useParams();
  const { data: collection } = useCollection(collectionId);
  const {
    data: itemPages,
    size,
    setSize,
    atEnd,
    mutate,
  } = useItems(collectionId);

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
          {itemPages?.flat(1).map((item) => (
            <ItemComponent key={item.id} {...{ item, mutate }} />
          ))}
        </ul>
        {!atEnd && (
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
        )}
      </Container>
    </>
  ) : (
    <Loading />
  );
}

function ItemComponent({
  item,
  mutate,
}: {
  item: Item;
  mutate: KeyedMutator<Item[][]>;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formItem, setFormItem] = useState(item);

  const deleteHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteItem(item, mutate);
    setShowDelete(false);
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormItem({ ...formItem, [name]: value.trimStart() });
  };

  const cancelEditHandler = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    setFormItem(item);
    setShowEdit(false);
  };

  const saveHandler = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    await editItem(formItem, mutate);
    setShowEdit(false);
  };

  const enterHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveHandler(e);
    }
  };

  return (
    <li key={item.url} className="icon-card">
      <div className="icon-card-title-wrap">
        <div className="icon-card-content">
          <h2 className="icon-card-title">
            <Link to={item.url}>{item.title}</Link>
          </h2>
        </div>
        <DropdownMenuWrapper
          className="dropdown is-flush-right"
          isOpen={showDropdown}
          setIsOpen={setShowDropdown}
        >
          <Button
            type="action"
            icon="ellipses"
            ariaControls="item-dropdown"
            ariaHasPopup="menu"
            ariaExpanded={showDropdown || undefined}
            onClickHandler={() => {
              setShowDropdown(!showDropdown);
            }}
          />
          <DropdownMenu>
            <ul className="dropdown-list" id="item-dropdown">
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
        <MDNModal
          isOpen={showEdit}
          size="small"
          onRequestClose={cancelEditHandler}
        >
          <header className="modal-header">
            <h2 className="modal-heading">Edit item</h2>
            <Button
              onClickHandler={cancelEditHandler}
              type="action"
              icon="cancel"
              extraClasses="close-button"
            />
          </header>
          <div className="modal-body">
            <form className="watch-submenu is-in-modal" onSubmit={saveHandler}>
              <div className="watch-submenu-item border-top-0 padding-top-0">
                <label htmlFor="item-title">Title:</label>
                <input
                  id="item-title"
                  name="title"
                  value={formItem.title}
                  onChange={changeHandler}
                  onKeyDown={enterHandler}
                  autoComplete="off"
                  type="text"
                  required={true}
                />
              </div>
              <div className="watch-submenu-item border-top-0">
                <label htmlFor="item-notes">Notes:</label>
                <input
                  id="item-notes"
                  name="notes"
                  value={formItem.notes}
                  onChange={changeHandler}
                  onKeyDown={enterHandler}
                  autoComplete="off"
                  type="text"
                />
              </div>
              <div className="watch-submenu-item border-top-0 is-button-row is-always-visible">
                <Button buttonType="submit">Save</Button>
                <Button onClickHandler={cancelEditHandler} type="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </MDNModal>
        <MDNModal
          isOpen={showDelete}
          size="small"
          onRequestClose={() => setShowDelete(false)}
        >
          <header className="modal-header">
            <h2 className="modal-heading">Delete item</h2>
            <Button
              onClickHandler={() => setShowDelete(false)}
              type="action"
              icon="cancel"
              extraClasses="close-button"
            />
          </header>
          <div className="modal-body">
            Are you sure you want to delete "{item.title}" from your collection?
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
      </div>
      {item.notes && <p className="icon-card-description">{item.notes}</p>}
    </li>
  );
}
