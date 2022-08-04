import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import type BCD from "@mdn/browser-compat-data/types";

export const BrowserInfoContext = React.createContext<BCD.Browsers | null>(
  null
);

export function BrowserName({ id }: { id: BCD.BrowserName }) {
  const browserInfo = useContext(BrowserInfoContext);
  const { t } = useTranslation("bcd");
  if (!browserInfo) {
    throw new Error(t("error.missingBrowserInfo"));
  }
  return <>{browserInfo[id].name}</>;
}
