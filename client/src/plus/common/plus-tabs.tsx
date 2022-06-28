import { Button } from "../../ui/atoms/button";
import { TabVariant } from "./tabs";
import { CollectionsTab } from "../collections/collections-tab";
import { FrequentlyViewedTab } from "../collections/frequently-viewed-tab";
import {
  NotificationsTab,
  StarredNotificationsTab,
} from "../notifications/notifications-tab";
import { WatchedTab } from "../notifications/watched-items-tab";

export function PlusTabs({
  currentTab,
  selectedTerms,
  selectedFilter,
  selectedSort,
}) {
  return (
    <>
      {currentTab === TabVariant.NOTIFICATIONS && (
        <NotificationsTab
          selectedTerms={selectedTerms}
          selectedSort={selectedSort}
          selectedFilter={selectedFilter}
        />
      )}
      {currentTab === TabVariant.STARRED && (
        <StarredNotificationsTab
          selectedTerms={selectedTerms}
          selectedSort={selectedSort}
          selectedFilter={selectedFilter}
        />
      )}
      {currentTab === TabVariant.WATCHING && (
        <WatchedTab
          selectedTerms={selectedTerms}
          selectedSort={selectedSort}
          selectedFilter={selectedFilter}
        />
      )}
      {currentTab === TabVariant.COLLECTIONS && (
        <CollectionsTab
          selectedTerms={selectedTerms}
          selectedSort={selectedSort}
          selectedFilter={selectedFilter}
        />
      )}
      {currentTab === TabVariant.FREQUENTLY_VIEWED && (
        <FrequentlyViewedTab selectedTerms={selectedTerms} />
      )}
    </>
  );
}

export function showMoreButton(setSelectAllChecked, setOffset, list: any[]) {
  return (
    <div className="pagination">
      <Button
        type="primary"
        onClickHandler={() => {
          setSelectAllChecked(false);
          setOffset(list.length);
        }}
      >
        Show more
      </Button>
    </div>
  );
}
