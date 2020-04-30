import React, { useContext, useMemo, useState } from "react";
import type bcd from "mdn-browser-compat-data/types";

type Id = [number, bcd.BrowserNames];

const AccordionContext = React.createContext<{
  activeId: Id | null;
  setActiveId(id: Id | null);
} | null>(null);

export function AccordionProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<Id | null>(null);

  const contextValue = useMemo(
    () => ({
      activeId,
      setActiveId(id) {
        setActiveId(id);
      },
    }),
    [activeId]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      {children}
    </AccordionContext.Provider>
  );
}

/**
 * This hook can be used to determine whether notes for a browser in a given row
 * should be shown. If so it returns that browser's name.
 */
export function useAccordionParent(rowIndex: number): bcd.BrowserNames | null {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Missing accordion context");
  }

  if (!context.activeId) {
    return null;
  }

  const [index, browser] = context.activeId;
  return index === rowIndex ? browser : null;
}

/**
 * This hook can be used to determine whether notes for a given browser in a
 * given row should be shown. It returns a boolean indicating that and a
 * function to toggle it.
 */
export function useAccordion(
  rowIndex: number,
  browser: bcd.BrowserNames
): [boolean, () => void] {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Missing accordion context");
  }

  const id: Id = [rowIndex, browser];

  const isOpen = JSON.stringify(context.activeId) === JSON.stringify(id);

  return [
    isOpen,
    function toggle() {
      context.setActiveId(isOpen ? null : id);
    },
  ];
}
