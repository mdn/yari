import React from "react";

import { SiteSearchQuery } from "./types";

export default function SiteSearchForm({
  query,
  locale,
  onSubmit,
}: {
  query: SiteSearchQuery;
  locale: string;
  onSubmit: (query: SiteSearchQuery) => void;
}) {
  const [newQ, setNewQ] = React.useState(query.q);
  return (
    <form
      action={`/${locale}/search`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(query);
        // setSearchParams({ q: newQ });
      }}
    >
      <input
        type="search"
        name="q"
        value={newQ}
        onChange={(event) => setNewQ(event.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
