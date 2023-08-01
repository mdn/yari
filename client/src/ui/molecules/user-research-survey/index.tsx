import { useEffect, useState } from "react";
import { Doc } from "../../../../../libs/types/document";
import { Icon } from "../../atoms/icon";

import "./index.scss";

const LOCAL_STORAGE_KEY = "user_research.2023_07.hidden";

export function UserResearchSurvey({ doc }: { doc: Doc }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (/en-US\/docs\/Learn(\/|$)/i.test(doc.mdn_url)) {
      setHidden(
        Boolean(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "false"))
      );
    }
  }, [doc.mdn_url]);

  const dismiss = () => {
    setHidden(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, "true");
  };

  return hidden ? null : (
    <div className="user-research-banner">
      We want to hear from you! Help guide development on MDN and participate in
      our{" "}
      <a
        href="https://survey.alchemer.com/s3/7444036/MDN-User-Research"
        className="external"
        target="_blank"
        rel="noreferrer"
      >
        user research survey
      </a>
      .
      <div className="dismiss">
        <button
          type="button"
          aria-label={"Hide this survey"}
          onClick={() => dismiss()}
          title={"Hide this survey"}
        >
          <Icon name={"cancel"} />
        </button>
      </div>
    </div>
  );
}
