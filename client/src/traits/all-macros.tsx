import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Document, MacroInfo } from "./types";

export function AllMacroUses({
  macros,
  documents,
}: {
  macros: MacroInfo[];
  documents: Document[];
}) {
  const [sortMacros, setSortMacros] = useState("alphabetically");
  const [filterMacros, setFilterMacros] = useState("");
  const [hideNeverused, setHideNeverused] = useState(false);
  const [hideUnmatched, setHideUnmatched] = useState(false);

  const displayMacros = macros
    .sort((a, b) => {
      if (sortMacros === "popularity") {
        return b.totalCount - a.totalCount;
      } else if (sortMacros === "popularityReverse") {
        return a.totalCount - b.totalCount;
      }
      let reverse = sortMacros === "alphabeticallyReverse" ? -1 : 1;
      return reverse * a.normalizedName.localeCompare(b.normalizedName);
    })
    .filter((m) => {
      const search = filterMacros.trim().toLowerCase();
      if (hideNeverused && !m.totalCount) return false;
      return (
        !(search && search.length > 1) || m.normalizedName.includes(search)
      );
    });

  const [filterDocuments, setFilterDocuments] = useState("");

  const displayDocuments = documents
    .filter((d) => {
      if (hideUnmatched) {
        if (
          !displayMacros.some((macro) => {
            return d.normalizedMacrosCount[macro.normalizedName] || 0;
          })
        ) {
          return false;
        }
      }
      const search = filterDocuments.trim().toLowerCase();
      return (
        !(search && search.length > 2) ||
        d.mdn_url.toLowerCase().includes(search)
      );
    })
    .slice(0, 25);

  return (
    <div className="all-macros-used">
      <h4>Every Macro Used</h4>
      <small>
        This is only the <i>immediate</i> uses of macros. A macro might call
        another macro inside itself, and never mentioned in a document.
      </small>
      <table>
        <thead>
          <tr>
            <th className="filter">
              <div className="filter-macros">
                <input
                  type="search"
                  placeholder="Filter macros"
                  value={filterMacros}
                  onChange={(event) => {
                    setFilterMacros(event.target.value);
                  }}
                />
                <br />
                <label htmlFor="id_sort_macros">Sort by:</label>
                <select
                  id="id_sort_macros"
                  value={sortMacros}
                  onChange={(event) => {
                    const { value } = event.target;
                    setSortMacros(value);
                  }}
                >
                  <option value="alphabetically">A-Z</option>
                  <option value="alphabeticallyReverse">Z-A</option>
                  <option value="popularity">Frequent</option>
                  <option value="popularityReverse">Rare</option>
                </select>
                <br />
                <label htmlFor="id_hide_neverused">Hide never-used</label>
                <input
                  type="checkbox"
                  id="id_hide_neverused"
                  checked={hideNeverused}
                  onChange={(event) => {
                    setHideNeverused(event.target.checked);
                  }}
                />
              </div>

              <div className="filter-documents">
                <input
                  type="search"
                  placeholder="Filter documents"
                  value={filterDocuments}
                  onChange={(event) => {
                    setFilterDocuments(event.target.value);
                  }}
                />
                <br />
                <label htmlFor="id_hide_unmatched">Hide unmatched</label>
                <input
                  type="checkbox"
                  id="id_hide_unmatched"
                  checked={hideUnmatched}
                  onChange={(event) => {
                    setHideUnmatched(event.target.checked);
                  }}
                />
              </div>
            </th>
            {displayMacros.map((macro) => {
              return (
                <th
                  className="macro"
                  key={macro.normalizedName}
                  title={`Total count across ALL documents: ${macro.totalCount.toLocaleString()}`}
                >
                  <span className="name">{macro.sourceName}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayDocuments.map((document) => {
            return (
              <tr key={document.mdn_url}>
                <td className="mdn_url">
                  <Link to={document.mdn_url} title={`"${document.title}"`}>
                    {document.mdn_url.replace("/en-US/docs", "…")}
                  </Link>
                </td>
                {displayMacros.map((macro) => {
                  const count =
                    document.normalizedMacrosCount[macro.normalizedName] || 0;
                  return (
                    <td
                      className="count"
                      key={macro.normalizedName}
                      title={macro.sourceName}
                    >
                      {count ? (
                        <b>{count}</b>
                      ) : (
                        <span className="zero">{count}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
