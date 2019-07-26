import React from "react";

export function NoMatch({ location, message = null }) {
  return (
    <div>
      <h3>Page Not Found</h3>
      <p>
        {message ? message : `Sorry, no document for ${location.pathname}.`}
      </p>
    </div>
  );
}
