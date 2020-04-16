import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import { Homepage } from "./homepage";
import { Document } from "./document";
import { NoMatch } from "./routing";
import { SearchWidget } from "./search";

export function App(appProps) {
  return (
    <div>
      <Header />

      <section className="section">
        <Routes>
          {/* Consider using useRoutes() hook instead! */}
          <Route path="/" element={<Homepage />} />
          <Route path="/:locale/docs/*" element={<Document {...appProps} />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </section>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  return (
    <header>
      <h1>
        <Link to="/">MDN Web Docs</Link>
      </h1>
      <SearchWidget
        onRedirect={(uri) => {
          console.log("Let's navigate to:", uri);
          navigate(uri);
        }}
      />
    </header>
  );
}
