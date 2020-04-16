import React from "react";

export function NoMatch(props) {
  console.log(props);
  const message = "";
  const location = { pathname: "fff" };
  return (
    <div>
      <h3>Page Not Found</h3>
      <p>
        {message ? message : `Sorry, no document for ${location.pathname}.`}
      </p>
    </div>
  );
}
