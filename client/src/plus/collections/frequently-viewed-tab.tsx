import { useState, useEffect } from "react";
import { BookmarkData } from ".";
import { useUIStatus } from "../../ui-context";
import { useFrequentlyViewedData } from "../common/api";
import { SORTS } from "../common/tabs";
import SearchFilter from "../search-filter";
import { CollectionListItem } from "./collection-list-item";

export function FrequentlyViewedTab({ selectedTerms }) {
  const { setToastData } = useUIStatus();
  const [list, setList] = useState<Array<any>>([]);

  const { data, setFrequentlyViewed } = useFrequentlyViewedData(selectedTerms);

  useEffect(() => {
    if (data) {
      setList(
        data.map((item) => {
          return { ...item, checked: false };
        })
      );
    }
  }, [data]);

  const deleteFrequentlyViewed = async (bookmarkData: BookmarkData) => {
    const original = list;
    const filteredEntries = list.filter(
      (entry) => entry.url !== bookmarkData.url
    );
    setFrequentlyViewed(filteredEntries);
    setList(filteredEntries);
    setToastData({
      mainText: "The page has been removed.",
      shortText: "Article removed",
      buttonText: "UNDO",
      buttonHandler: async () => {
        setFrequentlyViewed(original);
        setList(original);
        setToastData(null);
      },
    });
  };

  return (
    <>
      <SearchFilter filters={[]} sorts={SORTS} />
      <ul className="notification-list">
        <div className="icon-card-list">
          {list.map((item) => (
            <CollectionListItem
              item={item}
              onEditSubmit={() => null}
              key={item.id}
              showEditButton={false}
              handleDelete={deleteFrequentlyViewed}
            />
          ))}
        </div>
      </ul>
    </>
  );
}
