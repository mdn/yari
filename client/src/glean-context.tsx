import * as React from "react";
import { useContext, useEffect, useState } from "react";
import Glean from "@mozilla/glean/web";

const GleanContext = React.createContext<Glean>(Glean);

export function GleanProvider(props: { children: React.ReactNode }) {
  return (
    <GleanContext.Provider value={Glean}>
      {props.children}
    </GleanContext.Provider>
  );
}
