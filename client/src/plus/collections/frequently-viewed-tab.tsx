import { useState, useEffect } from "react";
import { FrequentlyViewedEntry } from "../../document/types";
import { useUIStatus } from "../../ui-context";
import { useFrequentlyViewedData } from "../common/api";
import { SORTS } from "../common/tabs";
import SearchFilter from "../search-filter";
import { CollectionListItem } from "./collection-list-item";

export function FrequentlyViewedTab({ selectedTerms }) {
  const { setToastData } = useUIStatus();
  const [list, setList] = useState<Array<FrequentlyViewedEntry>>([]);

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

  const deleteFrequentlyViewed = async (item: any) => {
    item = item as FrequentlyViewedEntry;
    const original = list;
    const filteredEntries = list.filter((entry) => entry.url !== item.url);
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
          {list.length
            ? list.map((item) => (
                <CollectionListItem
                  key={item.url}
                  item={item}
                  handleDelete={deleteFrequentlyViewed}
                />
              ))
            : "There are no items in your frequently viewed articles collection."}
        </div>
      </ul>
    </>
  );
}
