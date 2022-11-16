import React, { useContext } from "react";
import type BCD from "@mdn/browser-compat-data/types";

export const BrowserInfoContext = React.createContext<BCD.Browsers | null>(
  null
);

export function BrowserName({ id }: { id: BCD.BrowserName }) {
  const browserInfo = useContext(BrowserInfoContext);
  if (!browserInfo) {
    throw new Error("Missing browser info");
  }
  return <>{browserInfo[id].name}</>;
}
