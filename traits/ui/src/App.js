import React from "react";

import { Elasticsearch, Facet, SearchBox, Results } from "react-elasticsearch";

function App() {
  return (
    <Elasticsearch url={"/mdn_documents/_search"}>
      <SearchBox id="mainSearch" />
      <Facet id="tags" fields={["tags"]} />
      <Results
        id="result"
        items={(data) => data.map((item) => <>{item._source.title}</>)}
      />
    </Elasticsearch>
  );
}

export default App;
