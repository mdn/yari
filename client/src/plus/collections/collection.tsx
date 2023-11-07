import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import useSWR, { KeyedMutator } from "swr";
import { useScrollToTop, useLocale } from "../../hooks";
import { Button } from "../../ui/atoms/button";
import Container from "../../ui/atoms/container";
import { Loading } from "../../ui/atoms/loading";
import { camelWrap, charSlice, getCategoryByPathname } from "../../utils";
import { FrequentlyViewedItem, Item, useCollection, useItems } from "./api";
import NoteCard from "../../ui/molecules/notecards";
import { DocMetadata } from "../../../../libs/types/document";
import { Authors, LastModified } from "../../document/organisms/metadata";
import { ArticleActions } from "../../ui/organisms/article-actions";
import { MDN_PLUS_TITLE } from "../../constants";

import "./collection.scss";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  FrequentlyViewedCollection,
  useFrequentlyViewed,
} from "./frequently-viewed";
import { useGleanClick } from "../../telemetry/glean-context";
import { PLUS_COLLECTIONS } from "../../telemetry/constants";
dayjs.extend(relativeTime);

export function CollectionComponent() {
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
  document.title = `${name || "Collections"} | ${MDN_PLUS_TITLE}`;
  const description =
    collection?.name === "Default"
      ? "The default collection."
      : collection?.description;

  return collection ? (
    <div className="collections collections-collection">
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
    </div>
  ) : (
    <div className="collections collections-collection">
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
    </div>
  );
}

export function FrequentlyViewedCollectionComponent() {
  let [size, setSize] = useState(0);
  let [atEnd, setAtEnd] = useState(false);
  let frequentlyViewed: FrequentlyViewedCollection = useFrequentlyViewed(
    10,
    size,
    setAtEnd
  );

  useScrollToTop();

  return (
    <div className="collections collections-collection">
      <header>
        <Container>
          <Link to="../" className="exit">
            &larr; Back
          </Link>
          <h1>{frequentlyViewed.name}</h1>
          <span className="count">
            {frequentlyViewed.article_count}{" "}
            {frequentlyViewed.article_count === 1 ? "article" : "articles"}
          </span>
          <p>{frequentlyViewed.description}</p>
        </Container>
      </header>
      <Container>
        {frequentlyViewed.items.map((item) => (
          <ItemComponent addNoteEnabled={false} key={item.id} item={item} />
        ))}
        {!atEnd && (
          <div className="pagination">
            <Button
              type="primary"
              onClickHandler={() => {
                setSize(size + 10);
              }}
            >
              Show more
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}

function ItemComponent({
  addNoteEnabled = true,
  item,
  mutate,
}: {
  addNoteEnabled?: boolean;
  item: Item | FrequentlyViewedItem;
  mutate?: KeyedMutator<Item[][]>;
}) {
  const [slicedNote, setSlicedNote] = useState<string>();
  const [note, setNote] = useState<string>();

  const locale = useLocale();
  const gleanClick = useGleanClick();

  useEffect(() => {
    const slicedNote = item.notes && charSlice(item.notes, 0, 180);
    setSlicedNote(slicedNote);
    setNote(slicedNote);
  }, [item.notes]);

  const breadcrumbs = item.parents
    .slice(0, -1)
    .map((parent) => camelWrap(parent.title))
    .filter(
      // remove duplicated titles
      (title, index, titles) => title !== titles[index + 1]
    );

  const openBookmarkMenu: React.MouseEventHandler = (e) => {
    const article = e.currentTarget.closest("article");
    [
      article?.querySelector(".article-actions-toggle"),
      article?.querySelector(".bookmark-button"),
    ].forEach((button) => {
      if (button instanceof HTMLElement) {
        if (getComputedStyle(button).display === "none") return;
        button.click();
      }
    });
  };

  const { data: doc } = useSWR<DocMetadata>(
    `${item.url}/metadata.json`,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw Error(response.statusText);
      }

      return (await response.json()) as DocMetadata;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const category = getCategoryByPathname(item.url);

  return (
    <article
      key={item.url}
      className={category ? `category-${category}` : undefined}
    >
      <header>
        <h2>
          <Link to={item.url}>{camelWrap(item.title)}</Link>
        </h2>
        <ArticleActions
          doc={doc}
          showTranslations={false}
          item={"collection_id" in item ? item : undefined}
          scopedMutator={mutate}
        />
      </header>
      <div className="breadcrumbs">{breadcrumbs.join(" > ")}</div>
      {doc && (
        <>
          <p>{doc.summary}</p>
          <aside>
            <LastModified value={doc.modified} locale={locale} />,{" "}
            <Authors url={item.url} />
          </aside>
        </>
      )}
      {note ? (
        <div className="note">
          <div>
            {doc && (
              <Button
                icon="edit"
                type="action"
                onClickHandler={(e) => {
                  gleanClick(PLUS_COLLECTIONS.ACTIONS_NOTE_EDIT);
                  return openBookmarkMenu(e);
                }}
              >
                <span className="visually-hidden">Edit note</span>
              </Button>
            )}
          </div>
          <div className="text">
            <p className={item.notes?.includes("{") ? "code" : ""}>
              {note.trimEnd()}
            </p>
            {slicedNote !== item.notes &&
              (note !== item.notes ? (
                <>
                  {"… "}
                  <Button
                    type="link"
                    onClickHandler={() => setNote(item.notes)}
                  >
                    See full note
                  </Button>
                </>
              ) : (
                <>
                  {" "}
                  <Button
                    type="link"
                    onClickHandler={() => setNote(slicedNote)}
                  >
                    Show less
                  </Button>
                </>
              ))}
          </div>
        </div>
      ) : doc && addNoteEnabled ? (
        <Button
          extraClasses="add-note"
          icon="edit"
          type="action"
          onClickHandler={(e) => {
            gleanClick(PLUS_COLLECTIONS.ACTIONS_NOTE_ADD);
            return openBookmarkMenu(e);
          }}
        >
          Add note
        </Button>
      ) : null}
    </article>
  );
}
