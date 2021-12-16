import { Button } from "../../atoms/button";

import "./index.scss";

export default function SearchFilter({ filters, sorts }) {
  return (
    <form className="search-filter">
      <input type="search" />

      <div className="search-filter-filters">
        <Button type="action">Filters</Button>
      </div>

      <div className="search-filter-sorts">
        <Button type="action">Sort</Button>
      </div>
    </form>
  );
}
