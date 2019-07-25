import React from "react";
import { Route, Switch, Link } from "react-router-dom";

import { Homepage } from "./homepage";
import { Document } from "./document";
import { NoMatch } from "./routing";

export function App(appProps) {
  return (
    <div>
      <Route path="/" component={Header} />
      <section className="section">
        <Switch>
          <Route path="/" exact component={Homepage} />
          <Route
            path="/docs/:slug*"
            render={props => <Document {...props} {...appProps} />}
          />
          <Route component={NoMatch} />
        </Switch>
      </section>
    </div>
  );
}

function Header(props) {
  return (
    <header>
      <h1>
        <Link to="/">MDN Web Docs</Link>
      </h1>
    </header>
  );
}
