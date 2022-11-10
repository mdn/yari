import { useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { KeyedMutator } from "swr";
import { useScrollToTop } from "../../hooks";
import { Button } from "../../ui/atoms/button";
import Container from "../../ui/atoms/container";
import { Loading } from "../../ui/atoms/loading";
import MDNModal from "../../ui/atoms/modal";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { camelWrap } from "../../utils";
import {
  Item,
  useCollection,
  useItemDelete,
  useItemEdit,
  useItems,
} from "./api";
import NoteCard from "../../ui/molecules/notecards";
import ExpandingTextarea from "../../ui/atoms/form/expanding-textarea";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useFrequentlyViewed } from "./frequently-viewed";
dayjs.extend(relativeTime);

export default function CollectionComponent() {
  const { collectionId } = useParams();
  const { data: collection, error: collectionError } =
    useCollection(collectionId);
  const {
    data: itemPages,
    error: itemError,
    isLoading: itemLoading,
    size,
    setSize,
    atEnd,
    mutate,
  } = useItems(collectionId);

  useScrollToTop();
  const name =
    collection?.name === "Default" ? "Saved Articles" : collection?.name;
  const description =
    collection?.name === "Default"
      ? "The default collection."
      : collection?.description;

  return collection ? (
    <>
      <header>
        <Container>
          <Link to="../" className="exit">
            &larr; Back
          </Link>
          <h1>{name}</h1>
          <span className="count">
            {collection.article_count}{" "}
            {collection.article_count === 1 ? "article" : "articles"}
          </span>
          {description && <p>{description}</p>}
        </Container>
      </header>
      <Container>
        {itemPages
          ?.flat(1)
          .map((item) => (
            <ItemComponent key={item.id} {...{ item, mutate }} />
          )) ||
          (itemLoading && <Loading />)}
        {!atEnd && (
          <div className="pagination">
            <Button
              type="primary"
              onClickHandler={() => {
                setSize(size + 1);
              }}
              isDisabled={itemLoading}
            >
              {itemLoading
                ? "Loading..."
                : itemError
                ? "Error (try again)"
                : "Show more"}
            </Button>
          </div>
        )}
      </Container>
    </>
  ) : (
    <>
      <header>
        <Container>
          <Link to="../" className="exit">
            &larr; Back
          </Link>
        </Container>
      </header>
      <Container>
        {collectionError ? (
          <NoteCard type="error">
            <h4>Error</h4>
            <p>{collectionError.message}</p>
            <Button href="../" type="secondary">
              Go Back
            </Button>
          </NoteCard>
        ) : (
          <Loading />
        )}
      </Container>
    </>
  );
}

function FrequentlyViewedCollectionComponent() {
  let [size, setSize] = useState(0);
  let [atEnd, setAtEnd] = useState(false);
  let frequentlyViewed = useFrequentlyViewed(10, size, setAtEnd);
  let _vals: Item[] | undefined = frequentlyViewed?.items.map((v) => {
    return {
      collection_id: frequentlyViewed?.name || "",
      updated_at: dayjs(v.timestamp).toISOString(),
      created_at: dayjs(v.timestamp).toISOString(),
      notes: "",
      id: v.serial.toString(),
      parents: [],
      url: v.url,
      title: v.title,
    };
  });
  let mutate = (_vals) => Promise.resolve(_vals);
  useScrollToTop();

  return (
    <>
      <header>
        <Container>
          <Link to="../" className="exit">
            &larr; Back
          </Link>
          <h1>{frequentlyViewed?.name}</h1>
          <span className="count">
            {frequentlyViewed?.article_count}{" "}
            {frequentlyViewed?.article_count === 1 ? "article" : "articles"}
          </span>
          <p>{frequentlyViewed?.description}</p>
        </Container>
      </header>
      <Container>
        {_vals?.flat(1).map((item) => (
          <ItemComponent key={item.id} {...{ item, mutate }} />
        ))}
        {!atEnd && (
          <div className="pagination">
            <Button
              type="primary"
              onClickHandler={() => {
                console.log(`set size ${size}`);
                setSize(size + 10);
              }}
              isDisabled={false}
            >
              Show more
            </Button>
          </div>
        )}
      </Container>
    </>
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

  const breadcrumbs = item.parents
    .slice(0, -1)
    .map((parent) => camelWrap(parent.title))
    .filter(
      // remove duplicated titles
      (title, index, titles) => title !== titles[index + 1]
    );

  return (
    <article key={item.url}>
      <header>
        <h2>
          <Link to={item.url}>{camelWrap(item.title)}</Link>
        </h2>
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
        <ItemEdit show={showEdit} setShow={setShowEdit} {...{ item, mutate }} />
        <ItemDelete
          show={showDelete}
          setShow={setShowDelete}
          {...{ item, mutate }}
        />
      </header>
      <div className="breadcrumbs">{breadcrumbs.join(" > ")}</div>
      {item.notes && <p>{camelWrap(item.notes)}</p>}
      <footer>
        <time dateTime={dayjs(item.updated_at).toISOString()}>
          Edited {dayjs(item.updated_at).fromNow().toString()}
        </time>
      </footer>
    </article>
  );
}

function ItemEdit({
  show,
  setShow,
  item,
  mutate,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  item: Item;
  mutate: KeyedMutator<Item[][]>;
}) {
  const [formItem, setFormItem] = useState(item);

  const { mutator, isPending, error, resetError } = useItemEdit(mutate);

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormItem({ ...formItem, [name]: value });
  };

  const cancelHandler = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (isPending) return;
    resetError();
    setFormItem(item);
    setShow(false);
  };

  const saveHandler = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (isPending) return;
    await mutator(formItem);
    setShow(false);
  };

  return (
    <MDNModal
      isOpen={show}
      size="small"
      onRequestClose={cancelHandler}
      extraOverlayClassName={isPending ? "wait" : ""}
    >
      <header className="modal-header">
        <h2 className="modal-heading">Edit item</h2>
        <Button
          onClickHandler={cancelHandler}
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
        <form className="mdn-form" onSubmit={saveHandler}>
          <div className="mdn-form-item">
            <label htmlFor="item-title">Title:</label>
            <input
              id="item-title"
              name="title"
              value={formItem.title}
              onChange={changeHandler}
              autoComplete="off"
              type="text"
              required={true}
              disabled={isPending}
            />
          </div>
          <div className="mdn-form-item">
            <label htmlFor="item-notes">Notes:</label>
            <ExpandingTextarea
              id="item-notes"
              name="notes"
              value={formItem.notes}
              onChange={changeHandler}
              autoComplete="off"
              disabled={isPending}
            />
          </div>
          <div className="mdn-form-item is-button-row">
            <Button buttonType="submit" isDisabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              onClickHandler={cancelHandler}
              type="secondary"
              isDisabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </MDNModal>
  );
}

function ItemDelete({
  show,
  setShow,
  item,
  mutate,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  item: Item;
  mutate: KeyedMutator<Item[][]>;
}) {
  const { mutator, isPending, error, resetError } = useItemDelete(mutate);

  const cancelHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPending) return;
    resetError();
    setShow(false);
  };

  const deleteHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPending) return;
    await mutator(item);
    setShow(false);
  };

  return (
    <MDNModal
      isOpen={show}
      size="small"
      onRequestClose={cancelHandler}
      extraOverlayClassName={isPending ? "wait" : ""}
    >
      <header className="modal-header">
        <h2 className="modal-heading">Delete item</h2>
        <Button
          onClickHandler={cancelHandler}
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
          Are you sure you want to delete "{item.title}" from your collection?
        </p>
        <div className="mdn-form-item is-button-row">
          <Button onClickHandler={deleteHandler} isDisabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button
            onClickHandler={cancelHandler}
            type="secondary"
            isDisabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </MDNModal>
  );
}

export { FrequentlyViewedCollectionComponent };
