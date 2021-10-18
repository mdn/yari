import { BookmarkToggle } from "../../molecules/bookmark";
import { Breadcrumbs } from "../../molecules/breadcrumbs";

import { useUserData } from "../../../user-context";

import { Doc } from "../../../document/types";

import "./index.scss";

export const UtilityBar = ({ doc }: { doc: Doc }) => {
  const userData = useUserData();
  const isSubscriber = userData && userData.isSubscriber;

  return (
    <div className="utilitybar">
      {/* if we have breadcrumbsfor the current page, continue rendering the section */}
      {doc.parents && <Breadcrumbs parents={doc.parents} />}
      <div className="utilities">
        {isSubscriber && <BookmarkToggle doc={doc} />}
      </div>
    </div>
  );
};
